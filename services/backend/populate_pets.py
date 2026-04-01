import random
from django.db.models import Exists, OuterRef, Q
from residential.models import ResidentialUnit, Pet, ResidentUnitAssignment

SPECIES_POOL = ['Canino', 'Felino', 'Ave', 'Otro']

NAMES_BY_SPECIES = {
    'Canino': ['Max', 'Luna', 'Rocky', 'Nala', 'Thor', 'Maya', 'Bruno', 'Kira', 'Zeus', 'Toby', 'Simba', 'Lola'],
    'Felino': ['Mishi', 'Milo', 'Loki', 'Cleo', 'Salem', 'Nube', 'Nina', 'Tom', 'Luna', 'Sombra', 'Kiara'],
    'Ave': ['Kiwi', 'Paco', 'Lima', 'Blue', 'Pipo', 'Sol', 'Coco', 'Mango'],
    'Otro': ['Bugs', 'Nemo', 'Rex', 'Chispa', 'Dori', 'Bola', 'Nube']
}

BREEDS_BY_SPECIES = {
    'Canino': ['Labrador', 'Criollo', 'Pastor Alemán', 'Golden', 'Poodle', 'Beagle', 'Schnauzer'],
    'Felino': ['Criollo', 'Persa', 'Siames', 'Bengala', 'Maine Coon'],
    'Ave': ['Periquito', 'Canario', 'Cacatua', 'Agapornis'],
    'Otro': [None]
}

COLORS = ['Negro', 'Blanco', 'Miel', 'Gris', 'Café', 'Dorado', 'Atigrado', 'Tricolor']
AGES = ['Cachorro', 'Joven', 'Adulto', 'Senior', '1 año', '2 años', '3 años', '4 años', '5 años']
GENDERS = ['Macho', 'Hembra', 'No especificado']
STATUSES = ['Al Día', 'Pendiente', 'En Observación', 'Tratamiento']
OBSERVATIONS = [
    None,
    'Alérgico a ciertos alimentos.',
    'Requiere control veterinario anual.',
    'Muy sociable con niños.',
    'Se pone nervioso con ruidos fuertes.'
]


def pick_unique_names(species: str, count: int):
    names = NAMES_BY_SPECIES.get(species, [])
    if count <= len(names):
        return random.sample(names, count)
    return [random.choice(names) for _ in range(count)]


def create_pet_for_unit(unit: ResidentialUnit, name: str, species: str) -> None:
    breed_options = BREEDS_BY_SPECIES.get(species, [None])
    breed = random.choice(breed_options) if breed_options else None
    vaccinated = random.random() < 0.7
    status = 'Al Día' if vaccinated else random.choice(STATUSES)

    Pet.objects.create(
        unit=unit,
        name=name,
        species=species,
        breed=breed,
        color=random.choice(COLORS),
        age=random.choice(AGES),
        gender=random.choice(GENDERS),
        vaccinated=vaccinated,
        status=status,
        observations=random.choice(OBSERVATIONS),
    )


def run(min_pets: int = 1, max_pets: int = 3) -> None:
    units = ResidentialUnit.objects.annotate(
        has_assignments=Exists(ResidentUnitAssignment.objects.filter(unit=OuterRef('pk')))
    ).filter(
        Q(status__in=['Propietario', 'Arrendado']) | Q(has_assignments=True)
    ).order_by('tower', 'unit_number')
    total_created = 0

    for unit in units:
        if unit.pets.exists():
            continue

        target_count = unit.pet_count if unit.pet_count and unit.pet_count > 0 else random.randint(min_pets, max_pets)
        species_choices = [random.choice(SPECIES_POOL) for _ in range(target_count)]

        for species in set(species_choices):
            names = pick_unique_names(species, species_choices.count(species))
            for name in names:
                create_pet_for_unit(unit, name, species)
                total_created += 1

        unit.pet_count = unit.pets.count()
        unit.save(update_fields=['pet_count'])

    print(f"Mascotas creadas: {total_created}")


if __name__ == '__main__':
    run()
