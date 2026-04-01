from __future__ import annotations

from ninja import Schema
from typing import List, Optional
from datetime import date, datetime

class UnitBriefSchema(Schema):
    tower: str
    unit_number: str

class PersonUnitAssignmentSchema(UnitBriefSchema):
    is_owner: bool = False
    is_resident: bool = False

class VehicleBriefSchema(Schema):
    plate: str
    status: str
    observations: Optional[str] = None

class ParkingSpaceSchema(Schema):
    id: int
    number: str
    type: str
    status: str
    unit: Optional[UnitBriefSchema] = None
    vehicle: Optional[VehicleBriefSchema] = None

class ParkingSpaceUpdateSchema(Schema):
    status: Optional[str] = None
    unit_id: Optional[int] = None

class PersonSchema(Schema):
    document_number: str
    first_name: str
    last_name: str
    document_type: str
    role: str
    email: Optional[str] = None
    phone: Optional[str] = None
    is_minor: bool
    is_elderly: bool
    has_disability: bool
    is_realtor: bool
    registration_date: Optional[date] = None
    data_authorization: bool
    observations: Optional[str] = None

class PersonDetailSchema(PersonSchema):
    units: List[PersonUnitAssignmentSchema]

class VehicleSchema(Schema):
    plate: str
    type: str
    brand: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    status: str
    observations: Optional[str] = None
    parking_space: Optional[ParkingSpaceSchema] = None

class VehicleDetailSchema(VehicleSchema):
    unit: Optional[UnitBriefSchema] = None

class VehicleUpdateSchema(Schema):
    type: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    status: Optional[str] = None
    observations: Optional[str] = None
    parking_space_id: Optional[int] = None

class PetSchema(Schema):
    id: Optional[int] = None
    name: str
    species: str
    breed: Optional[str] = None
    color: Optional[str] = None
    age: Optional[str] = None
    gender: str
    vaccinated: bool
    status: str
    observations: Optional[str] = None

class PetDetailSchema(PetSchema):
    unit: UnitBriefSchema

class PetInputSchema(Schema):
    name: str
    species: str = "Canino"
    breed: Optional[str] = None
    color: Optional[str] = None
    age: Optional[str] = None
    gender: str = "No especificado"
    vaccinated: bool = False
    status: Optional[str] = None
    observations: Optional[str] = None

class PetUpdateSchema(Schema):
    name: Optional[str] = None
    species: Optional[str] = None
    breed: Optional[str] = None
    color: Optional[str] = None
    age: Optional[str] = None
    gender: Optional[str] = None
    vaccinated: Optional[bool] = None
    status: Optional[str] = None
    observations: Optional[str] = None

class AssignmentSchema(Schema):
    person: PersonSchema
    is_owner: bool
    is_resident: bool

class UnitDocumentSchema(Schema):
    id: int
    document_type: str
    file: str
    original_name: str
    mime_type: str
    size: int
    created_at: datetime
    updated_at: datetime

class ResidentialUnitSchema(Schema):
    tower: str
    unit_number: str
    status: str
    is_under_remodelation: bool = False
    pet_count: int
    bicycle_count: int

    tags: List[str]
    authorizations: Optional[str] = None
    observations: Optional[str] = None
    owner_count: int = 0
    resident_count: int = 0
    vehicle_count: int = 0
    parking: str = ""
    parking_count: int = 0
    has_parking_conflict: bool = False
    parking_integrity_issue: Optional[str] = None

class ResidentialUnitDetailSchema(ResidentialUnitSchema):
    assignments: List[AssignmentSchema]
    vehicles: List[VehicleSchema]
    pets: List[PetSchema]
    documents: List[UnitDocumentSchema] = []
    parking_spaces: List[ParkingSpaceSchema] = []
    private_parking_space: Optional[ParkingSpaceSchema] = None

class ResidentialUnitUpdateSchema(Schema):
    status: Optional[str] = None
    is_under_remodelation: Optional[bool] = None
    pet_count: Optional[int] = None
    bicycle_count: Optional[int] = None

    tags: Optional[List[str]] = None
    authorizations: Optional[str] = None
    observations: Optional[str] = None

class PersonUpdateSchema(Schema):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    is_minor: Optional[bool] = None
    is_elderly: Optional[bool] = None
    has_disability: Optional[bool] = None
    is_realtor: Optional[bool] = None
    data_authorization: Optional[bool] = None
    observations: Optional[str] = None

class PersonAssignmentInput(Schema):
    document_number: str
    is_owner: bool = False
    is_resident: bool = True

class VehicleAssignmentInput(Schema):
    plate: str
    type: str = "Automóvil"
    brand: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    status: str = "Activo"
    observations: Optional[str] = None

class ErrorSchema(Schema):
    message: str
