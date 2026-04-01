from __future__ import annotations

from typing import Iterable

from .models import ParkingSpace, ResidentialUnit


def build_private_parking_number(index: int) -> str:
    return f"P-{index:03d}"


def build_visitor_parking_number(index: int) -> str:
    return f"V-{index:02d}"


def _next_available_number(prefix: str, used_numbers: set[str], width: int = 3) -> str:
    counter = 1
    while True:
        candidate = f"{prefix}-{counter:0{width}d}"
        if candidate not in used_numbers:
            return candidate
        counter += 1


def get_parking_display_status(parking_space: ParkingSpace) -> str:
    if parking_space.status == "MANTENIMIENTO":
        return parking_space.status

    return "OCUPADO" if parking_space.vehicle else parking_space.status


def attach_parking_display_status(parking_spaces: Iterable[ParkingSpace]) -> list[ParkingSpace]:
    hydrated_spaces = list(parking_spaces)
    for parking_space in hydrated_spaces:
        parking_space.status = get_parking_display_status(parking_space)
    return hydrated_spaces


def attach_unit_parking_metadata(
    unit: ResidentialUnit,
    parking_spaces: Iterable[ParkingSpace] | None = None,
) -> ResidentialUnit:
    parking_spaces = list(parking_spaces) if parking_spaces is not None else list(unit.parking_spaces.all())
    private_spaces = [space for space in parking_spaces if space.type == "PRIVADO"]

    unit.private_parking_space = private_spaces[0] if private_spaces else None
    unit.parking = ", ".join(space.number for space in private_spaces)
    unit.parking_count = len(private_spaces)
    unit.has_parking_conflict = len(private_spaces) != 1

    if len(private_spaces) == 0:
        unit.parking_integrity_issue = "La unidad no tiene parqueadero privado asignado."
    elif len(private_spaces) > 1:
        unit.parking_integrity_issue = "La unidad tiene multiples parqueaderos privados asignados."
    else:
        unit.parking_integrity_issue = None

    return unit


def ensure_parking_inventory(
    *,
    visitor_spaces: int = 10,
    units: Iterable[ResidentialUnit] | None = None,
) -> dict[str, int]:
    ordered_units = list(
        units
        if units is not None
        else ResidentialUnit.objects.all().order_by("tower", "unit_number")
    )
    used_numbers = set(ParkingSpace.objects.values_list("number", flat=True))
    private_unit_ids = set(
        ParkingSpace.objects.filter(type="PRIVADO")
        .exclude(unit_id__isnull=True)
        .values_list("unit_id", flat=True)
    )

    created_private = 0
    for index, unit in enumerate(ordered_units, start=1):
        if unit.id in private_unit_ids:
            continue

        preferred_number = build_private_parking_number(index)
        number = (
            preferred_number
            if preferred_number not in used_numbers
            else _next_available_number("P", used_numbers)
        )
        ParkingSpace.objects.create(
            number=number,
            type="PRIVADO",
            status="DISPONIBLE",
            unit=unit,
        )
        used_numbers.add(number)
        created_private += 1

    existing_visitor_count = ParkingSpace.objects.filter(type="VISITANTE").count()
    created_visitors = 0

    for index in range(existing_visitor_count + 1, visitor_spaces + 1):
        preferred_number = build_visitor_parking_number(index)
        number = (
            preferred_number
            if preferred_number not in used_numbers
            else _next_available_number("V", used_numbers, width=2)
        )
        ParkingSpace.objects.create(
            number=number,
            type="VISITANTE",
            status="DISPONIBLE",
        )
        used_numbers.add(number)
        created_visitors += 1

    return {
        "units": len(ordered_units),
        "created_private": created_private,
        "created_visitors": created_visitors,
        "private_total": ParkingSpace.objects.filter(type="PRIVADO").count(),
        "visitor_total": ParkingSpace.objects.filter(type="VISITANTE").count(),
    }
