from django.contrib import admin
from .models import ResidentialUnit, Person, ResidentUnitAssignment, Vehicle, Pet, UnitDocument, ParkingSpace

class ResidentUnitAssignmentInline(admin.TabularInline):
    model = ResidentUnitAssignment
    extra = 1

class VehicleInline(admin.TabularInline):
    model = Vehicle
    extra = 1

class PetInline(admin.TabularInline):
    model = Pet
    extra = 1

class UnitDocumentInline(admin.TabularInline):
    model = UnitDocument
    extra = 0
    readonly_fields = ('original_name', 'mime_type', 'size', 'created_at', 'updated_at')

@admin.register(ResidentialUnit)
class ResidentialUnitAdmin(admin.ModelAdmin):
    list_display = ('tower', 'unit_number', 'status', 'is_under_remodelation', 'pet_count', 'bicycle_count')
    list_filter = ('tower', 'status', 'is_under_remodelation')
    search_fields = ('tower', 'unit_number')
    inlines = [ResidentUnitAssignmentInline, VehicleInline, PetInline, UnitDocumentInline]

@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ('document_number', 'first_name', 'last_name', 'document_type', 'role', 'email')
    list_filter = ('document_type', 'role', 'is_minor', 'is_elderly')
    search_fields = ('document_number', 'first_name', 'last_name', 'email')
    inlines = [ResidentUnitAssignmentInline]

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('plate', 'unit', 'status')
    list_filter = ('status',)
    search_fields = ('plate', 'unit__tower', 'unit__unit_number')


@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    list_display = ('name', 'species', 'unit', 'gender', 'vaccinated', 'status')
    list_filter = ('species', 'gender', 'vaccinated', 'status')
    search_fields = ('name', 'species', 'unit__tower', 'unit__unit_number')

@admin.register(UnitDocument)
class UnitDocumentAdmin(admin.ModelAdmin):
    list_display = ('document_type', 'unit', 'original_name', 'created_at')
    list_filter = ('document_type', 'created_at')
    search_fields = ('unit__tower', 'unit__unit_number', 'original_name')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(ParkingSpace)
class ParkingSpaceAdmin(admin.ModelAdmin):
    list_display = ('number', 'type', 'status', 'unit')
    list_filter = ('type', 'status')
    search_fields = ('number', 'unit__tower', 'unit__unit_number')
