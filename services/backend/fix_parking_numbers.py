from residential.models import ResidentialUnit, ParkingSpace

def run():
    print(">>> Renombrando parqueaderos para eliminar referencia a unidades en el número...")
    
    # 1. Privados: Renombrar secuencialmente
    # Ordenamos por torre y apt para que el orden sea predecible
    private_spaces = ParkingSpace.objects.filter(type='PRIVADO').select_related('unit').order_by('unit__tower', 'unit__unit_number')
    
    for i, p in enumerate(private_spaces, 1):
        old_number = p.number
        new_number = f"P-{i:03d}"
        p.number = new_number
        p.save()
        # print(f"  {old_number} -> {new_number} (Unidad: {p.unit})")

    # 2. Visitantes: Ya están bien como V-01, V-02... pero asegurémonos
    visitor_spaces = ParkingSpace.objects.filter(type='VISITANTE').order_by('number')
    for i, p in enumerate(visitor_spaces, 1):
        p.number = f"V-{i:02d}"
        p.save()

    print(f">>> Proceso completado. {private_spaces.count()} parqueaderos privados renombrados.")

if __name__ == "__main__":
    run()
