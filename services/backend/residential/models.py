from django.core.exceptions import ValidationError
from django.db.models import Model as DjangoModel, CharField, IntegerField, TextField, BooleanField, DateField, DateTimeField, ForeignKey, FileField, PROTECT, CASCADE, JSONField, EmailField, OneToOneField, SET_NULL, Q, UniqueConstraint

class ResidentialUnit(DjangoModel):
    STATUS_CHOICES = [
        ('Propietario', 'Propietario'),
        ('Arrendado', 'Arrendado'),
        ('Desocupado', 'Desocupado'),
    ]

    tower = CharField(max_length=50, verbose_name="Torre")
    unit_number = CharField(max_length=50, verbose_name="Apartamento")
    status = CharField(max_length=20, choices=STATUS_CHOICES, default='Desocupado', verbose_name="Estado")
    is_under_remodelation = BooleanField(default=False, verbose_name="En Remodelación/Obra")
    pet_count = IntegerField(default=0, verbose_name="Mascotas")
    bicycle_count = IntegerField(default=0, verbose_name="Bicicletas")
    tags = JSONField(default=list, blank=True, verbose_name="Tags")
    authorizations = CharField(max_length=255, blank=True, null=True, verbose_name="Autorizaciones")
    observations = TextField(blank=True, null=True, verbose_name="Observaciones")

    class Meta:
        verbose_name = "Unidad Residencial"
        verbose_name_plural = "Unidades Residenciales"
        unique_together = ('tower', 'unit_number')

    def __str__(self):
        return f"{self.tower}-{self.unit_number}"

class UnitDocument(DjangoModel):
    DOCUMENT_TYPES = [
        ('Contrato de Arrendamiento', 'Contrato de Arrendamiento'),
        ('Certificado de Propiedad', 'Certificado de Propiedad'),
        ('Contrato de Obra', 'Contrato de Obra'),
        ('Otro', 'Otro'),
    ]

    unit = ForeignKey(ResidentialUnit, on_delete=CASCADE, related_name='documents', verbose_name="Unidad")
    document_type = CharField(max_length=50, choices=DOCUMENT_TYPES, verbose_name="Tipo de Documento")
    file = FileField(upload_to='unit_documents/', verbose_name="Archivo")
    original_name = CharField(max_length=255, verbose_name="Nombre Original")
    mime_type = CharField(max_length=100, verbose_name="Tipo MIME")
    size = IntegerField(verbose_name="Tamaño (bytes)")
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Documento de Unidad"
        verbose_name_plural = "Documentos de Unidades"

    def __str__(self):
        return f"{self.document_type} - {self.unit}"

class Person(DjangoModel):
    DOCUMENT_TYPES = [
        ('CC', 'Cédula de Ciudadanía'),
        ('CE', 'Cédula de Extranjería'),
        ('TI', 'Tarjeta de Identidad'),
        ('RC', 'Registro Civil'),
    ]
    
    ROLE_CHOICES = [
        ('Propietario', 'Propietario'),
        ('Residente', 'Residente'),
    ]

    document_number = CharField(max_length=50, primary_key=True, verbose_name="Número de Documento")
    first_name = CharField(max_length=100, verbose_name="Nombres")
    last_name = CharField(max_length=100, verbose_name="Apellidos")
    document_type = CharField(max_length=5, choices=DOCUMENT_TYPES, verbose_name="Tipo de Documento")
    role = CharField(max_length=20, choices=ROLE_CHOICES, default='Residente', verbose_name="Rol")
    email = EmailField(blank=True, null=True, verbose_name="Correo Electrónico")
    phone = CharField(max_length=50, blank=True, null=True, verbose_name="Teléfonos")
    is_minor = BooleanField(default=False, verbose_name="Es Menor de Edad")
    is_elderly = BooleanField(default=False, verbose_name="Es Adulto Mayor")
    has_disability = BooleanField(default=False, verbose_name="Tiene Discapacidad")
    is_realtor = BooleanField(default=False, verbose_name="Inmobiliaria")
    registration_date = DateField(null=True, blank=True, verbose_name="Fecha de Registro")
    data_authorization = BooleanField(default=False, verbose_name="Autoriza Datos Personales")
    observations = TextField(blank=True, null=True, verbose_name="Observaciones")

    class Meta:
        verbose_name = "Persona"
        verbose_name_plural = "Personas"

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.document_number})"

class ResidentUnitAssignment(DjangoModel):
    unit = ForeignKey(ResidentialUnit, on_delete=CASCADE, related_name='assignments')
    person = ForeignKey(Person, on_delete=CASCADE, related_name='assignments')
    is_owner = BooleanField(default=False, verbose_name="Es Propietario")
    is_resident = BooleanField(default=True, verbose_name="Es Residente")

    class Meta:
        verbose_name = "Asignación de Unidad"
        verbose_name_plural = "Asignaciones de Unidades"
        unique_together = ('unit', 'person')

class Vehicle(DjangoModel):
    TYPE_CHOICES = [
        ('Automóvil', 'Automóvil'),
        ('Camioneta', 'Camioneta'),
        ('Motocicleta', 'Motocicleta'),
        ('Bicicleta', 'Bicicleta'),
        ('Otro', 'Otro'),
    ]
    STATUS_CHOICES = [
        ('Activo', 'Activo'),
        ('Inactivo', 'Inactivo'),
    ]

    plate = CharField(max_length=20, verbose_name="Placa")
    unit = ForeignKey(ResidentialUnit, on_delete=CASCADE, related_name='vehicles', null=True, blank=True, verbose_name="Apartamento")
    type = CharField(max_length=20, choices=TYPE_CHOICES, default='Automóvil', verbose_name="Tipo")
    brand = CharField(max_length=80, blank=True, null=True, verbose_name="Marca")
    model = CharField(max_length=80, blank=True, null=True, verbose_name="Modelo")
    color = CharField(max_length=80, blank=True, null=True, verbose_name="Color")
    parking_space = OneToOneField('ParkingSpace', on_delete=SET_NULL, related_name='parking_assignment', null=True, blank=True, verbose_name="Parqueadero")
    status = CharField(max_length=20, choices=STATUS_CHOICES, default='Activo', verbose_name="Estado")
    observations = CharField(max_length=255, blank=True, null=True, verbose_name="Observaciones")

    class Meta:
        verbose_name = "Vehículo"
        verbose_name_plural = "Vehículos"

    def clean(self):
        errors = {}

        if self.parking_space_id and self.unit_id is None:
            errors["unit"] = "Un vehiculo con parqueadero asignado debe estar vinculado a una unidad."

        if self.parking_space_id and self.unit_id is not None:
            parking_space = self.parking_space
            if parking_space.type != "PRIVADO":
                errors["parking_space"] = "Solo se pueden asignar parqueaderos privados a vehiculos de una unidad."
            elif parking_space.unit_id != self.unit_id:
                errors["parking_space"] = "El parqueadero asignado no pertenece a la unidad del vehiculo."

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.plate} ({self.unit})"

class ParkingSpace(DjangoModel):
    TYPE_CHOICES = [
        ('PRIVADO', 'Privado'),
        ('VISITANTE', 'Visitante'),
    ]
    STATUS_CHOICES = [
        ('DISPONIBLE', 'Disponible'),
        ('OCUPADO', 'Ocupado'),
        ('MANTENIMIENTO', 'Mantenimiento'),
    ]

    number = CharField(max_length=50, unique=True, verbose_name="Número")
    type = CharField(max_length=20, choices=TYPE_CHOICES, default='PRIVADO', verbose_name="Tipo")
    status = CharField(max_length=20, choices=STATUS_CHOICES, default='DISPONIBLE', verbose_name="Estado")
    unit = ForeignKey(ResidentialUnit, on_delete=CASCADE, related_name='parking_spaces', null=True, blank=True, verbose_name="Unidad")

    @property
    def vehicle(self):
        try:
            return self.parking_assignment
        except Vehicle.DoesNotExist:
            return None

    class Meta:
        verbose_name = "Parqueadero"
        verbose_name_plural = "Parqueaderos"
        constraints = [
            UniqueConstraint(
                fields=["unit"],
                condition=Q(type="PRIVADO", unit__isnull=False),
                name="residential_private_parking_per_unit",
            ),
        ]

    def clean(self):
        errors = {}

        if self.type == "PRIVADO" and self.unit_id is None:
            errors["unit"] = "Todo parqueadero privado debe estar asociado a una unidad."

        if self.type == "VISITANTE" and self.unit_id is not None:
            errors["unit"] = "Los parqueaderos de visitantes no pueden asignarse a una unidad."

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.number} ({self.type})"


class Pet(DjangoModel):
    GENDER_CHOICES = [
        ('Macho', 'Macho'),
        ('Hembra', 'Hembra'),
        ('No especificado', 'No especificado'),
    ]

    unit = ForeignKey(ResidentialUnit, on_delete=CASCADE, related_name='pets', verbose_name="Apartamento")
    name = CharField(max_length=100, verbose_name="Nombre")
    species = CharField(max_length=50, default='Canino', verbose_name="Especie")
    breed = CharField(max_length=100, blank=True, null=True, verbose_name="Raza")
    color = CharField(max_length=80, blank=True, null=True, verbose_name="Color")
    age = CharField(max_length=20, blank=True, null=True, verbose_name="Edad")
    gender = CharField(max_length=20, choices=GENDER_CHOICES, default='No especificado', verbose_name="Género")
    vaccinated = BooleanField(default=False, verbose_name="Vacunado")
    status = CharField(max_length=30, default='Al Día', verbose_name="Estado")
    observations = TextField(blank=True, null=True, verbose_name="Observaciones")

    class Meta:
        verbose_name = "Mascota"
        verbose_name_plural = "Mascotas"

    def __str__(self):
        return f"{self.name} ({self.unit})"
