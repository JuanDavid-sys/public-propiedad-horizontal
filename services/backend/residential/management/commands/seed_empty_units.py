from django.core.management.base import BaseCommand
from django.db import transaction

from residential.models import ResidentialUnit
from residential.parking import ensure_parking_inventory


class Command(BaseCommand):
    help = (
        "Crea una estructura base de unidades residenciales vacias. "
        "Por defecto genera 10 torres, 16 pisos y 4 apartamentos por piso."
    )

    def add_arguments(self, parser):
        parser.add_argument("--towers", type=int, default=10, help="Cantidad de torres a crear.")
        parser.add_argument("--floors", type=int, default=16, help="Cantidad de pisos por torre.")
        parser.add_argument(
            "--apartments-per-floor",
            type=int,
            default=4,
            help="Cantidad de apartamentos por piso.",
        )
        parser.add_argument(
            "--start-tower",
            type=int,
            default=1,
            help="Numero inicial de torre.",
        )
        parser.add_argument(
            "--visitor-spaces",
            type=int,
            default=10,
            help="Cantidad minima de parqueaderos para visitantes.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        towers = options["towers"]
        floors = options["floors"]
        apartments_per_floor = options["apartments_per_floor"]
        start_tower = options["start_tower"]
        visitor_spaces = options["visitor_spaces"]

        if towers <= 0 or floors <= 0 or apartments_per_floor <= 0 or visitor_spaces < 0:
            self.stdout.write(self.style.ERROR("Torres, pisos y apartamentos por piso deben ser mayores que cero; visitantes debe ser cero o mas."))
            return

        existing_pairs = set(
            ResidentialUnit.objects.values_list("tower", "unit_number")
        )

        units_to_create = []

        for tower_number in range(start_tower, start_tower + towers):
            tower = str(tower_number)
            for floor in range(1, floors + 1):
                for apartment in range(1, apartments_per_floor + 1):
                    unit_number = f"{floor}{apartment:02d}"
                    key = (tower, unit_number)
                    if key in existing_pairs:
                        continue

                    units_to_create.append(
                        ResidentialUnit(
                            tower=tower,
                            unit_number=unit_number,
                            status="Desocupado",
                            is_under_remodelation=False,
                            pet_count=0,
                            bicycle_count=0,
                            tags=[],
                            authorizations=None,
                            observations="",
                        )
                    )

        if units_to_create:
            ResidentialUnit.objects.bulk_create(units_to_create, batch_size=500)

        parking_summary = ensure_parking_inventory(visitor_spaces=visitor_spaces)

        total_units = towers * floors * apartments_per_floor
        current_total = ResidentialUnit.objects.count()

        self.stdout.write(
            self.style.SUCCESS(
                f"Estructura base procesada. "
                f"Creadas: {len(units_to_create)} unidades nuevas. "
                f"Esperadas para esta plantilla: {total_units}. "
                f"Total actual en base: {current_total}. "
                f"Parqueaderos privados: {parking_summary['private_total']}. "
                f"Parqueaderos visitantes: {parking_summary['visitor_total']}."
            )
        )
