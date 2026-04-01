import json
import os
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import transaction
from residential.models import ResidentialUnit, Person, ResidentUnitAssignment, Vehicle, ParkingSpace
from residential.parking import ensure_parking_inventory

class Command(BaseCommand):
    help = 'Carga datos residenciales desde archivos JSON'

    def handle(self, *args, **options):
        # Ruta dentro del contenedor (backend/residential/data_migration)
        base_path = '/app/residential/data_migration'
        
        if not os.path.exists(base_path):
            # Fallback local
            base_path = os.path.join(os.getcwd(), 'residential', 'data_migration')

        people_file = os.path.join(base_path, 'people.json')
        units_file = os.path.join(base_path, 'units.json')
        vehicles_file = os.path.join(base_path, 'vehicles.json')

        try:
            with transaction.atomic():
                self.load_people(people_file)
                self.load_units(units_file)
                self.load_vehicles(vehicles_file)
                ensure_parking_inventory()
                self.stdout.write(self.style.SUCCESS('¡Migración completada con éxito!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error durante la migración: {str(e)}'))

    def parse_bool(self, value):
        return value == "Sí"

    def load_people(self, file_path):
        self.stdout.write('Cargando personas...')
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for item in data:
                email = item.get('CORREO_ELECTRÓNICO')
                if email == "No Registrado": email = None
                
                phone = item.get('TELÉFONOS')
                if phone == "No Registrado": phone = None

                reg_date = item.get('FECHA_REGISTRO')
                if reg_date:
                    try:
                        reg_date = datetime.strptime(reg_date, '%Y-%m-%d').date()
                    except:
                        reg_date = None

                Person.objects.update_or_create(
                    document_number=item['NÚMERO_DE_DOCUMENTO'],
                    defaults={
                        'first_name': item['NOMBRES'],
                        'last_name': item['APELLIDOS'],
                        'document_type': item['TIPO_DE_DOCUMENTO'],
                        'role': item['ROL_EN_EL_CONJUNTO'],
                        'email': email,
                        'phone': phone,
                        'is_minor': self.parse_bool(item['ES_MENOR_DE_EDAD']),
                        'is_elderly': self.parse_bool(item['ES_ADULTO_MAYOR']),
                        'has_disability': self.parse_bool(item['TIENE_DISCAPACIDAD']),
                        'is_realtor': self.parse_bool(item['INMOBILIARIA']),
                        'registration_date': reg_date,
                        'data_authorization': self.parse_bool(item['AUTORIZA_DATOS_PERSONALES']),
                        'observations': item.get('OBSERVACIONES', '')
                    }
                )

    def load_units(self, file_path):
        self.stdout.write('Cargando unidades y asignaciones...')
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for item in data:
                # Crear Unidad
                tags_str = item.get('TAGS_ASIGNADOS', '')
                tags = [t.strip() for t in tags_str.split(',') if t.strip()]
                
                pet_count = 0
                try: pet_count = int(item.get('MASCOTAS_REG', 0))
                except: pass

                bicycle_count = 0
                try: bicycle_count = int(item.get('BICICLETAS', 0))
                except: pass

                unit, created = ResidentialUnit.objects.update_or_create(
                    tower=item['TORRE'],
                    unit_number=item['APARTAMENTO'],
                    defaults={
                        'status': item['ESTADO_DEL_APARTAMENTO'],
                        'pet_count': pet_count,
                        'bicycle_count': bicycle_count,
                        'tags': tags,
                        'authorizations': item.get('AUTORIZACIONES'),
                        'observations': item.get('OBSERVACIONES')
                    }
                )

                preferred_parking = (item.get('PARQUEADEROS') or '').split(',')[0].strip()
                if preferred_parking:
                    ParkingSpace.objects.update_or_create(
                        number=preferred_parking,
                        defaults={
                            'type': 'PRIVADO',
                            'status': 'DISPONIBLE',
                            'unit': unit,
                        }
                    )

                # Asignar Propietarios
                owner_ids = item.get('PROPIETARIOS_IDs', '')
                if owner_ids:
                    for oid in [id.strip() for id in owner_ids.split(',') if id.strip()]:
                        try:
                            person = Person.objects.get(document_number=oid)
                            ResidentUnitAssignment.objects.update_or_create(
                                unit=unit, person=person,
                                defaults={'is_owner': True, 'is_resident': False}
                            )
                        except Person.DoesNotExist:
                            self.stdout.write(self.style.WARNING(f'Persona {oid} no encontrada para propiedad en {unit}'))

                # Asignar Residentes
                resident_ids = item.get('RESIDENTES_IDs', '')
                if resident_ids:
                    for rid in [id.strip() for id in resident_ids.split(',') if id.strip()]:
                        try:
                            person = Person.objects.get(document_number=rid)
                            assignment, _ = ResidentUnitAssignment.objects.get_or_create(
                                unit=unit, person=person
                            )
                            assignment.is_resident = True
                            assignment.save()
                        except Person.DoesNotExist:
                            self.stdout.write(self.style.WARNING(f'Persona {rid} no encontrada para residencia en {unit}'))

    def load_vehicles(self, file_path):
        self.stdout.write('Cargando vehículos...')
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for item in data:
                # El campo APARTAMENTO en vehicles.json es "Torre-Apto" (ej. "1-101")
                dept_info = item['APARTAMENTO'].split('-')
                if len(dept_info) == 2:
                    tower, unit_no = dept_info
                    try:
                        unit = ResidentialUnit.objects.get(tower=tower, unit_number=unit_no)
                        parking_space = None
                        parking_number = (item.get('NÚMERO_PARQUEADERO') or '').strip()
                        if parking_number:
                            parking_space, _ = ParkingSpace.objects.update_or_create(
                                number=parking_number,
                                defaults={
                                    'type': 'PRIVADO',
                                    'status': 'DISPONIBLE',
                                    'unit': unit,
                                }
                            )
                        Vehicle.objects.update_or_create(
                            plate=item['VEHÍCULOS_PLACAS'].upper(),
                            defaults={
                                'unit': unit,
                                'type': item.get('TIPO') or 'Automóvil',
                                'brand': item.get('MARCA'),
                                'model': item.get('MODELO'),
                                'color': item.get('COLOR'),
                                'parking_space': parking_space,
                                'status': item.get('ESTADO') or 'Activo',
                                'observations': item.get('OBSERVACIONES')
                            }
                        )
                    except ResidentialUnit.DoesNotExist:
                        self.stdout.write(self.style.WARNING(f"Unidad {tower}-{unit_no} no encontrada para vehículo {item['VEHÍCULOS_PLACAS']}"))
