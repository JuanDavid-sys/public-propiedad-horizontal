from collections import defaultdict

from django.db import migrations, models
from django.db.models import Q


def normalize_private_parking_assignments(apps, schema_editor):
    ParkingSpace = apps.get_model("residential", "ParkingSpace")
    Vehicle = apps.get_model("residential", "Vehicle")

    vehicle_parking_ids = set(
        Vehicle.objects.exclude(parking_space_id__isnull=True).values_list("parking_space_id", flat=True)
    )

    grouped_spaces = defaultdict(list)
    orphan_spaces = []

    for space in ParkingSpace.objects.filter(type="PRIVADO").order_by("id"):
        if space.unit_id:
            grouped_spaces[space.unit_id].append(space)
        else:
            orphan_spaces.append(space)

    for spaces in grouped_spaces.values():
        primary = next((space for space in spaces if space.id in vehicle_parking_ids), spaces[0])
        for space in spaces:
            if space.id == primary.id:
                continue
            space.type = "VISITANTE"
            space.unit_id = None
            space.save(update_fields=["type", "unit"])

    for space in orphan_spaces:
        space.type = "VISITANTE"
        space.unit_id = None
        space.save(update_fields=["type", "unit"])


class Migration(migrations.Migration):

    dependencies = [
        ("residential", "0007_vehicle_metadata_and_unit_nullable"),
    ]

    operations = [
        migrations.RunPython(normalize_private_parking_assignments, migrations.RunPython.noop),
        migrations.AddConstraint(
            model_name="parkingspace",
            constraint=models.UniqueConstraint(
                condition=Q(type="PRIVADO", unit__isnull=False),
                fields=("unit",),
                name="residential_private_parking_per_unit",
            ),
        ),
    ]
