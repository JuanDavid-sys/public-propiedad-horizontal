from ninja import Router, File, Form, UploadedFile
from typing import List
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from .models import ResidentialUnit, Person, Vehicle, Pet, UnitDocument
from .schemas import (
    ResidentialUnitSchema, 
    ResidentialUnitDetailSchema, 
    ResidentialUnitUpdateSchema,
    UnitDocumentSchema,
    PersonSchema, 
    PersonDetailSchema,
    PersonUpdateSchema,
    PersonAssignmentInput,
    VehicleSchema, 
    VehicleDetailSchema,
    VehicleUpdateSchema,
    VehicleAssignmentInput,
    PetSchema,
    PetDetailSchema,
    PetInputSchema,
    PetUpdateSchema,
    ParkingSpaceSchema,
    ParkingSpaceUpdateSchema,
    ErrorSchema
)
from .models import ResidentUnitAssignment, ParkingSpace
from .parking import attach_parking_display_status, attach_unit_parking_metadata
from users.api import create_audit_log

router = Router()


def sync_unit_pet_count(unit: ResidentialUnit) -> None:
    unit.pet_count = unit.pets.count()
    unit.save(update_fields=['pet_count'])

@router.get("/units", response=List[ResidentialUnitSchema])
def list_units(request, tower: str = None, status: str = None):
    """Lista todas las unidades residenciales con filtros opcionales y conteos agregados"""
    qs = ResidentialUnit.objects.annotate(
        owner_count=Count('assignments', filter=Q(assignments__is_owner=True), distinct=True),
        resident_count=Count('assignments', filter=Q(assignments__is_resident=True), distinct=True),
        vehicle_count=Count('vehicles', distinct=True),
        # Conteo real de bicicletas basado en registros de vehículos
        bicycle_count_calc=Count('vehicles', filter=Q(vehicles__type='Bicicleta'), distinct=True),
    ).prefetch_related('parking_spaces').order_by('tower', 'unit_number')
    if tower:
        qs = qs.filter(tower=tower)
    if status:
        qs = qs.filter(status=status)
    units = list(qs)
    for unit in units:
        unit.bicycle_count = unit.bicycle_count_calc
        attach_unit_parking_metadata(unit)
    return units

@router.get("/units/{tower}/{unit_number}", response=ResidentialUnitDetailSchema)
def get_unit(request, tower: str, unit_number: str):
    """Obtiene el detalle completo de una unidad (incluyendo residentes, vehículos y documentos)"""
    unit = get_object_or_404(
        ResidentialUnit.objects.annotate(
            owner_count=Count('assignments', filter=Q(assignments__is_owner=True), distinct=True),
            resident_count=Count('assignments', filter=Q(assignments__is_resident=True), distinct=True),
            vehicle_count=Count('vehicles', distinct=True),
            # Conteo real de bicicletas basado en registros de vehículos
            bicycle_count_calc=Count('vehicles', filter=Q(vehicles__type='Bicicleta'), distinct=True),
        ).prefetch_related('assignments__person', 'vehicles__parking_space', 'pets', 'documents', 'parking_spaces__parking_assignment'),
        tower=tower, 
        unit_number=unit_number
    )
    unit.bicycle_count = unit.bicycle_count_calc
    parking_spaces = attach_parking_display_status(unit.parking_spaces.all())
    attach_unit_parking_metadata(unit, parking_spaces)
    return unit

@router.get("/people", response=List[PersonDetailSchema])
def list_people(request, role: str = None):
    """Lista todas las personas con sus unidades asociadas"""
    qs = Person.objects.all().prefetch_related('assignments__unit')
    if role:
        qs = qs.filter(role=role)
    
    # Ninja handles the mapping to PersonDetailSchema including units if we prepare it
    results = []
    for person in qs:
        # Añadimos las unidades al objeto para que Ninja las serialice
        person.units = [
            {
                "tower": a.unit.tower,
                "unit_number": a.unit.unit_number,
                "is_owner": a.is_owner,
                "is_resident": a.is_resident,
            }
            for a in person.assignments.all()
        ]
        results.append(person)
    return results

@router.get("/people/{document_number}", response=PersonDetailSchema)
def get_person(request, document_number: str):
    """Obtiene el detalle de una persona por su número de documento, incluyendo sus unidades asociados"""
    person = get_object_or_404(
        Person.objects.prefetch_related('assignments__unit'),
        document_number=document_number
    )
    
    # Enriquecemos el objeto persona con sus unidades
    units = []
    for assignment in person.assignments.all():
        units.append({
            "tower": assignment.unit.tower,
            "unit_number": assignment.unit.unit_number,
            "is_owner": assignment.is_owner,
            "is_resident": assignment.is_resident,
        })
    
    # Añadimos las unidades al objeto de respuesta
    response_data = person
    setattr(response_data, "units", units)
    
    return response_data

@router.patch("/units/{tower}/{unit_number}", response=ResidentialUnitSchema)
def update_unit(request, tower: str, unit_number: str, data: ResidentialUnitUpdateSchema):
    """Actualiza parcialmente una unidad residencial"""
    unit = get_object_or_404(ResidentialUnit, tower=tower, unit_number=unit_number)
    for attr, value in data.dict(exclude_unset=True).items():
        setattr(unit, attr, value)
    unit.save()
    create_audit_log(request.auth, 'unit_update', request, {'tower': tower, 'unit_number': unit_number})
    return unit

@router.post("/people", response={201: PersonSchema, 400: ErrorSchema})
def create_person(request, data: PersonSchema):
    """Crea un nuevo registro de persona"""
    if Person.objects.filter(document_number=data.document_number).exists():
        return 400, {"message": "Una persona con este documento ya existe"}
    
    person = Person.objects.create(**data.dict())
    create_audit_log(request.auth, 'person_create', request, {'document_number': data.document_number})
    return 201, person

@router.patch("/people/{document_number}", response=PersonSchema)
def update_person(request, document_number: str, data: PersonUpdateSchema):
    """Actualiza parcialmente los datos de una persona"""
    person = get_object_or_404(Person, document_number=document_number)
    for attr, value in data.dict(exclude_unset=True).items():
        setattr(person, attr, value)
    person.save()
    create_audit_log(request.auth, 'person_update', request, {'document_number': document_number})
    return person

@router.delete("/people/{document_number}", response={204: None, 404: ErrorSchema})
def delete_person(request, document_number: str):
    """Elimina permanentemente el registro de una persona"""
    person = get_object_or_404(Person, document_number=document_number)
    person.delete()
    create_audit_log(request.auth, 'person_delete', request, {'document_number': document_number})
    return 204, None


@router.get("/vehicles", response=List[VehicleDetailSchema])
def list_vehicles(request, plate: str = None):
    """Lista todos los vehículos con búsqueda por placa y detalles de unidad"""
    qs = Vehicle.objects.all().select_related('unit', 'parking_space')
    if plate:
        qs = qs.filter(plate__icontains=plate)
    return qs


@router.get("/vehicles/{plate}", response=VehicleDetailSchema)
def get_vehicle_by_plate(request, plate: str):
    """Obtiene el detalle de un vehículo por placa, con unidad opcional"""
    vehicle = get_object_or_404(Vehicle.objects.select_related('unit', 'parking_space'), plate__iexact=plate)
    return vehicle


@router.get("/units/{tower}/{unit_number}/vehicles/{plate}", response=VehicleDetailSchema)
def get_vehicle(request, tower: str, unit_number: str, plate: str):
    """Obtiene el detalle de un vehículo específico por unidad y placa"""
    unit = get_object_or_404(ResidentialUnit, tower=tower, unit_number=unit_number)
    vehicle = get_object_or_404(Vehicle.objects.select_related('unit', 'parking_space'), unit=unit, plate__iexact=plate)
    return vehicle


@router.patch("/units/{tower}/{unit_number}/vehicles/{plate}", response={200: VehicleSchema, 400: ErrorSchema})
def update_vehicle(request, tower: str, unit_number: str, plate: str, data: VehicleUpdateSchema):
    """Actualiza parcialmente los datos de un vehículo asociado a una unidad"""
    unit = get_object_or_404(ResidentialUnit, tower=tower, unit_number=unit_number)
    vehicle = get_object_or_404(Vehicle.objects.select_related('parking_space'), unit=unit, plate__iexact=plate)
    payload = data.dict(exclude_unset=True)

    if 'parking_space_id' in payload:
        parking_space_id = payload.pop('parking_space_id')
        if parking_space_id is None:
            vehicle.parking_space = None
        else:
            parking_space = get_object_or_404(ParkingSpace, id=parking_space_id)
            if parking_space.unit_id != unit.id:
                return 400, {"message": "El parqueadero no pertenece a la unidad del vehículo"}
            if parking_space.vehicle and parking_space.vehicle.id != vehicle.id:
                return 400, {"message": "El parqueadero ya está asignado a otro vehículo"}
            vehicle.parking_space = parking_space

    for attr, value in payload.items():
        setattr(vehicle, attr, value)
    vehicle.save()
    create_audit_log(request.auth, 'vehicle_update', request, {'plate': plate, 'unit': f"{tower}-{unit_number}"})
    return vehicle

@router.post("/units/{tower}/{unit_number}/assign-person", response={201: None, 404: ErrorSchema, 400: ErrorSchema})
def assign_person(request, tower: str, unit_number: str, data: PersonAssignmentInput):
    """Vincula una persona a una unidad residencial"""
    unit = get_object_or_404(ResidentialUnit, tower=tower, unit_number=unit_number)
    person = get_object_or_404(Person, document_number=data.document_number)
    
    assignment, created = ResidentUnitAssignment.objects.update_or_create(
        unit=unit, 
        person=person,
        defaults={
            'is_owner': data.is_owner,
            'is_resident': data.is_resident
        }
    )
    create_audit_log(request.auth, 'person_assign', request, {'tower': tower, 'unit_number': unit_number, 'document_number': data.document_number})
    return 201, None

@router.delete("/units/{tower}/{unit_number}/unassign-person/{document_number}", response={204: None, 404: ErrorSchema})
def unassign_person(request, tower: str, unit_number: str, document_number: str):
    """Desvincula una persona de una unidad residencial"""
    unit = get_object_or_404(ResidentialUnit, tower=tower, unit_number=unit_number)
    person = get_object_or_404(Person, document_number=document_number)
    
    assignment = get_object_or_404(ResidentUnitAssignment, unit=unit, person=person)
    assignment.delete()
    create_audit_log(request.auth, 'person_unassign', request, {'tower': tower, 'unit_number': unit_number, 'document_number': document_number})
    return 204, None

@router.post("/units/{tower}/{unit_number}/assign-vehicle", response={201: VehicleSchema, 404: ErrorSchema})
def assign_vehicle(request, tower: str, unit_number: str, data: VehicleAssignmentInput):
    """Assigns a vehicle to a residential unit, creating it if it does not exist."""
    unit = get_object_or_404(ResidentialUnit, tower=tower, unit_number=unit_number)

    payload = data.dict(exclude_unset=True)
    plate = data.plate.upper()

    vehicle, created = Vehicle.objects.get_or_create(
        plate=plate,
        defaults={
            'unit': unit,
            'type': data.type,
            'brand': data.brand,
            'model': data.model,
            'color': data.color,
            'status': data.status,
            'observations': data.observations,
        }
    )

    if not created:
        vehicle.unit = unit
        for attr, value in payload.items():
            if attr == 'plate':
                continue
            setattr(vehicle, attr, value)
        if vehicle.parking_space and vehicle.parking_space.unit_id != unit.id:
            vehicle.parking_space = None
        vehicle.save()

    create_audit_log(request.auth, 'vehicle_assign', request, {'tower': tower, 'unit_number': unit_number, 'plate': data.plate})
    return 201, vehicle

@router.delete("/units/{tower}/{unit_number}/unassign-vehicle/{plate}", response={204: None, 404: ErrorSchema})
def unassign_vehicle(request, tower: str, unit_number: str, plate: str):
    """Unassigns a vehicle from a residential unit without deleting it."""
    unit = get_object_or_404(ResidentialUnit, tower=tower, unit_number=unit_number)
    vehicle = get_object_or_404(Vehicle, plate=plate.upper(), unit=unit)
    vehicle.unit = None
    vehicle.parking_space = None
    vehicle.save()
    create_audit_log(request.auth, 'vehicle_unassign', request, {'tower': tower, 'unit_number': unit_number, 'plate': plate})
    return 204, None


@router.delete("/vehicles/{plate}", response={204: None, 404: ErrorSchema})
def delete_vehicle(request, plate: str):
    """Deletes a vehicle record permanently by plate."""
    vehicle = get_object_or_404(Vehicle, plate=plate.upper())
    vehicle.delete()
    create_audit_log(request.auth, 'vehicle_delete', request, {'plate': plate})
    return 204, None


@router.get("/pets", response=List[PetDetailSchema])
def list_pets(request, name: str = None):
    """Lista todas las mascotas registradas con su unidad asociada"""
    qs = Pet.objects.all().select_related('unit').order_by('unit__tower', 'unit__unit_number', 'name')
    if name:
        qs = qs.filter(name__icontains=name)
    return qs


@router.get("/pets/{pet_id}", response=PetDetailSchema)
def get_pet(request, pet_id: int):
    """Obtiene el detalle de una mascota por su ID"""
    pet = get_object_or_404(Pet.objects.select_related('unit'), id=pet_id)
    return pet


@router.post("/units/{tower}/{unit_number}/assign-pet", response={201: PetSchema, 404: ErrorSchema})
def assign_pet(request, tower: str, unit_number: str, data: PetInputSchema):
    """Vincula una mascota a una unidad residencial"""
    unit = get_object_or_404(ResidentialUnit, tower=tower, unit_number=unit_number)
    status = data.status or ('Al Día' if data.vaccinated else 'Pendiente')
    pet = Pet.objects.create(
        unit=unit,
        name=data.name,
        species=data.species,
        breed=data.breed,
        color=data.color,
        age=data.age,
        gender=data.gender,
        vaccinated=data.vaccinated,
        status=status,
        observations=data.observations,
    )
    sync_unit_pet_count(unit)
    create_audit_log(request.auth, 'pet_assign', request, {'tower': tower, 'unit_number': unit_number, 'pet_name': data.name})
    return 201, pet


@router.patch("/pets/{pet_id}", response=PetSchema)
def update_pet(request, pet_id: int, data: PetUpdateSchema):
    """Actualiza parcialmente los datos de una mascota"""
    pet = get_object_or_404(Pet, id=pet_id)
    payload = data.dict(exclude_unset=True)
    if 'vaccinated' in payload and 'status' not in payload:
        payload['status'] = 'Al Día' if payload['vaccinated'] else 'Pendiente'
    for attr, value in payload.items():
        setattr(pet, attr, value)
    pet.save()
    sync_unit_pet_count(pet.unit)
    create_audit_log(request.auth, 'pet_update', request, {'pet_id': pet_id})
    return pet


@router.delete("/pets/{pet_id}", response={204: None, 404: ErrorSchema})
def delete_pet(request, pet_id: int):
    """Elimina una mascota registrada"""
    pet = get_object_or_404(Pet, id=pet_id)
    unit = pet.unit
    pet.delete()
    sync_unit_pet_count(unit)
    create_audit_log(request.auth, 'pet_delete', request, {'pet_id': pet_id})
    return 204, None

# --- Document Endpoints ---

@router.get("/units/{tower}/{unit_number}/documents", response=List[UnitDocumentSchema])
def list_unit_documents(request, tower: str, unit_number: str):
    """Lista todos los documentos de una unidad"""
    unit = get_object_or_404(ResidentialUnit, tower=tower, unit_number=unit_number)
    return unit.documents.all()

@router.post("/units/{tower}/{unit_number}/documents", response={201: UnitDocumentSchema, 400: ErrorSchema})
def upload_unit_document(
    request, 
    tower: str, 
    unit_number: str, 
    document_type: str = Form(...), 
    file: UploadedFile = File(...)
):
    """Sube un documento para la unidad"""
    unit = get_object_or_404(ResidentialUnit, tower=tower, unit_number=unit_number)
    
    # Validaciones básicas de tipo
    allowed_types = [choice[0] for choice in UnitDocument.DOCUMENT_TYPES]
    if document_type not in allowed_types:
        return 400, {"message": f"Tipo de documento no válido. Tipos permitidos: {', '.join(allowed_types)}"}
    
    doc = UnitDocument.objects.create(
        unit=unit,
        document_type=document_type,
        file=file,
        original_name=file.name,
        mime_type=file.content_type,
        size=file.size
    )
    create_audit_log(request.auth, 'document_upload', request, {
        'tower': tower, 
        'unit_number': unit_number, 
        'document_type': document_type,
        'filename': file.name
    })
    return 201, doc

@router.delete("/units/{tower}/{unit_number}/documents/{document_id}", response={204: None, 404: ErrorSchema})
def delete_unit_document(request, tower: str, unit_number: str, document_id: int):
    """Elimina un documento específico de una unidad"""
    unit = get_object_or_404(ResidentialUnit, tower=tower, unit_number=unit_number)
    doc = get_object_or_404(UnitDocument, id=document_id, unit=unit)
    doc.delete()
    create_audit_log(request.auth, 'document_delete', request, {
        'tower': tower, 
        'unit_number': unit_number, 
        'document_id': document_id
    })
    return 204, None


# --- Parking Endpoints ---

@router.get("/parking", response=List[ParkingSpaceSchema])
def list_parking(request, type: str = None, unit_assigned: bool = None):
    """Lista todos los parqueaderos con filtros opcionales"""
    qs = ParkingSpace.objects.all().select_related('unit').prefetch_related('parking_assignment').order_by('number')
    if type:
        qs = qs.filter(type=type)
    if unit_assigned is not None:
        qs = qs.filter(unit__isnull=not unit_assigned)
    return attach_parking_display_status(qs)

@router.patch("/parking/{parking_id}", response={200: ParkingSpaceSchema, 400: ErrorSchema})
def update_parking(request, parking_id: int, data: ParkingSpaceUpdateSchema):
    """Actualiza un parqueadero (estado o unidad asignada)"""
    parking = get_object_or_404(ParkingSpace, id=parking_id)
    payload = data.dict(exclude_unset=True)
    
    if 'unit_id' in payload:
        unit_id = payload.pop('unit_id')
        if unit_id:
            if parking.type != 'PRIVADO':
                return 400, {"message": "Solo los parqueaderos privados pueden vincularse a una unidad"}
            unit = get_object_or_404(ResidentialUnit, id=unit_id)
            existing_private = ParkingSpace.objects.filter(type='PRIVADO', unit=unit).exclude(id=parking.id).first()
            if existing_private:
                return 400, {"message": "La unidad ya tiene un parqueadero privado asignado"}
            parking.unit = unit
        else:
            if parking.type == 'PRIVADO':
                return 400, {"message": "No se puede dejar una unidad sin parqueadero privado desde este endpoint"}
            parking.unit = None
            
    for attr, value in payload.items():
        setattr(parking, attr, value)
    
    parking.save()
    create_audit_log(request.auth, 'parking_update', request, {'parking_id': parking_id})
    return 200, parking

@router.post("/units/{tower}/{unit_number}/assign-parking", response={201: ParkingSpaceSchema, 400: ErrorSchema})
def assign_parking_to_unit(request, tower: str, unit_number: str, parking_id: int):
    """Asigna un parqueadero específico a una unidad"""
    unit = get_object_or_404(ResidentialUnit, tower=tower, unit_number=unit_number)
    parking = get_object_or_404(ParkingSpace, id=parking_id)
    
    if parking.type != 'PRIVADO':
        return 400, {"message": "Solo se pueden asignar parqueaderos de tipo PRIVADO a unidades"}

    existing_private = ParkingSpace.objects.filter(type='PRIVADO', unit=unit).exclude(id=parking.id).first()
    if existing_private:
        return 400, {"message": "La unidad ya tiene un parqueadero privado asignado"}
    
    parking.unit = unit
    parking.save()
    create_audit_log(request.auth, 'parking_assign', request, {'tower': tower, 'unit_number': unit_number, 'parking_id': parking_id})
    return 201, parking

@router.delete("/units/{tower}/{unit_number}/unassign-parking/{parking_id}", response={204: None, 400: ErrorSchema})
def unassign_parking_from_unit(request, tower: str, unit_number: str, parking_id: int):
    """Desvincula un parqueadero de una unidad residencial"""
    unit = get_object_or_404(ResidentialUnit, tower=tower, unit_number=unit_number)
    parking = get_object_or_404(ParkingSpace, id=parking_id, unit=unit)

    if parking.type == 'PRIVADO':
        return 400, {"message": "Cada unidad debe conservar su parqueadero privado asignado"}
    
    parking.unit = None
    parking.save()
    create_audit_log(request.auth, 'parking_unassign', request, {'tower': tower, 'unit_number': unit_number, 'parking_id': parking_id})
    return 204, None
