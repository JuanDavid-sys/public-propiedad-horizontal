from django.core.management.base import BaseCommand
from django.db import transaction

from residential.parking import ensure_parking_inventory


class Command(BaseCommand):
    help = (
        "Garantiza un inventario minimo de parqueaderos relacional: "
        "un parqueadero privado por unidad y un numero base de visitantes."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--visitor-spaces",
            type=int,
            default=10,
            help="Cantidad minima de parqueaderos para visitantes.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        visitor_spaces = options["visitor_spaces"]
        if visitor_spaces < 0:
            self.stdout.write(self.style.ERROR("La cantidad de parqueaderos de visitantes no puede ser negativa."))
            return

        summary = ensure_parking_inventory(visitor_spaces=visitor_spaces)
        self.stdout.write(
            self.style.SUCCESS(
                "Inventario de parqueaderos sincronizado. "
                f"Privados creados: {summary['created_private']}. "
                f"Visitantes creados: {summary['created_visitors']}. "
                f"Privados totales: {summary['private_total']}. "
                f"Visitantes totales: {summary['visitor_total']}."
            )
        )
