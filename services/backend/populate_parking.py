from residential.parking import ensure_parking_inventory

def run():
    summary = ensure_parking_inventory(visitor_spaces=10)
    print(
        "Inventario sincronizado. "
        f"Privados creados: {summary['created_private']}. "
        f"Visitantes creados: {summary['created_visitors']}."
    )

if __name__ == "__main__":
    run()
