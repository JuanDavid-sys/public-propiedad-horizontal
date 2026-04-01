from django.test import TestCase
from ninja.testing import TestClient

from .api import router
from .models import ResidentialUnit, ParkingSpace, Vehicle
from .parking import ensure_parking_inventory


class VehicleParkingAssignmentTests(TestCase):
    def setUp(self):
        self.client = TestClient(router)
        self.unit = ResidentialUnit.objects.create(tower="A", unit_number="101")
        self.other_unit = ResidentialUnit.objects.create(tower="B", unit_number="202")
        self.parking = ParkingSpace.objects.create(number="P-101", unit=self.unit)
        self.other_parking = ParkingSpace.objects.create(number="P-202", unit=self.other_unit)
        self.vehicle = Vehicle.objects.create(plate="ABC123", unit=self.unit, status="Activo")

    def test_assign_parking_to_vehicle_same_unit(self):
        response = self.client.patch(
            f"/units/{self.unit.tower}/{self.unit.unit_number}/vehicles/{self.vehicle.plate}",
            json={"parking_space_id": self.parking.id}
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["parking_space"]["id"], self.parking.id)

    def test_reject_parking_from_other_unit(self):
        response = self.client.patch(
            f"/units/{self.unit.tower}/{self.unit.unit_number}/vehicles/{self.vehicle.plate}",
            json={"parking_space_id": self.other_parking.id}
        )
        self.assertEqual(response.status_code, 400)

    def test_unassign_parking_from_vehicle(self):
        self.vehicle.parking_space = self.parking
        self.vehicle.save()
        response = self.client.patch(
            f"/units/{self.unit.tower}/{self.unit.unit_number}/vehicles/{self.vehicle.plate}",
            json={"parking_space_id": None}
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIsNone(payload.get("parking_space"))

    def test_unassign_vehicle_from_unit(self):
        self.vehicle.parking_space = self.parking
        self.vehicle.save()
        response = self.client.delete(
            f"/units/{self.unit.tower}/{self.unit.unit_number}/unassign-vehicle/{self.vehicle.plate}"
        )
        self.assertEqual(response.status_code, 204)
        self.vehicle.refresh_from_db()
        self.assertIsNone(self.vehicle.unit)
        self.assertIsNone(self.vehicle.parking_space)

    def test_delete_vehicle_by_plate(self):
        response = self.client.delete(f"/vehicles/{self.vehicle.plate}")
        self.assertEqual(response.status_code, 204)
        with self.assertRaises(Vehicle.DoesNotExist):
            Vehicle.objects.get(id=self.vehicle.id)

    def test_list_units_includes_private_parking_summary(self):
        response = self.client.get("/units")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        unit_payload = next(item for item in payload if item["tower"] == self.unit.tower and item["unit_number"] == self.unit.unit_number)
        self.assertEqual(unit_payload["parking"], self.parking.number)
        self.assertEqual(unit_payload["parking_count"], 1)
        self.assertFalse(unit_payload["has_parking_conflict"])

    def test_reject_unassign_private_parking_from_unit(self):
        response = self.client.delete(
            f"/units/{self.unit.tower}/{self.unit.unit_number}/unassign-parking/{self.parking.id}"
        )
        self.assertEqual(response.status_code, 400)

    def test_reject_second_private_parking_for_same_unit(self):
        third_unit = ResidentialUnit.objects.create(tower="C", unit_number="303")
        extra_parking = ParkingSpace.objects.create(number="P-999", type="PRIVADO", unit=third_unit)
        response = self.client.post(
            f"/units/{self.unit.tower}/{self.unit.unit_number}/assign-parking?parking_id={extra_parking.id}",
        )
        self.assertEqual(response.status_code, 400)

    def test_list_parking_marks_space_as_ocupado_when_vehicle_is_assigned(self):
        self.vehicle.parking_space = self.parking
        self.vehicle.save()

        response = self.client.get("/parking")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        parking_payload = next(item for item in payload if item["id"] == self.parking.id)
        self.assertEqual(parking_payload["status"], "OCUPADO")
        self.assertEqual(parking_payload["vehicle"]["plate"], self.vehicle.plate)


class ParkingInventoryTests(TestCase):
    def test_ensure_parking_inventory_creates_private_and_visitor_spaces(self):
        unit_a = ResidentialUnit.objects.create(tower="1", unit_number="101")
        unit_b = ResidentialUnit.objects.create(tower="1", unit_number="102")

        summary = ensure_parking_inventory(visitor_spaces=3)

        self.assertEqual(summary["created_private"], 2)
        self.assertEqual(summary["created_visitors"], 3)
        self.assertEqual(ParkingSpace.objects.filter(type="PRIVADO").count(), 2)
        self.assertEqual(ParkingSpace.objects.filter(type="VISITANTE").count(), 3)
        self.assertEqual(ParkingSpace.objects.filter(type="PRIVADO", unit=unit_a).count(), 1)
        self.assertEqual(ParkingSpace.objects.filter(type="PRIVADO", unit=unit_b).count(), 1)
