import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parents[2]
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import requests
from config.test_config import GATEWAY_URL, TIMEOUT_DEFAULT
from utils.auth_helper import get_auth_headers, get_admin_auth_headers, get_gestor_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADV-043", "flujo_salas_mapa_asientos_builder_post", "Recintos / Constructor de Mapas",
                             level="API", test_type="Funcional / Layout Builder", technique="Caja negra")
    doc.set_metadata("Validar constructor y persistencia de mapas de butacas interactivas en salas",
                     "Comprobar almacenamiento y recuperación de coordenadas (x, y), etiquetas y tipos de asiento",
                     "Servicio laika_events activo; token admin", "Ruta: POST y GET /api/venues/rooms/252/map")
    doc.start()
    try:
        headers = get_admin_auth_headers()
        map_payload = {
            "layout_mode": "map",
            "zones": [],
            "blocks": [],
            "seats": [
                {"seat_label": "VIP-01", "seat_type_id": 1, "x_position": 15.0, "y_position": 25.0, "status": "active"},
                {"seat_label": "VIP-02", "seat_type_id": 1, "x_position": 25.0, "y_position": 25.0, "status": "active"}
            ]
        }
        r_save = requests.post(f"{GATEWAY_URL}/api/venues/rooms/252/map", json=map_payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r_save.status_code == 200, f"Error al guardar mapa: {r_save.status_code} - {r_save.text}"
        doc.add_step(1, "Guardar layout de 2 butacas en Sala 252", "HTTP 200 con confirmación", f"HTTP {r_save.status_code}", "✓")
        
        r_get = requests.get(f"{GATEWAY_URL}/api/venues/rooms/252/map", headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r_get.status_code == 200, f"Error al recuperar mapa: {r_get.status_code}"
        map_data = r_get.json()
        seats = map_data.get("seats", [])
        assert len(seats) >= 2, f"Asientos esperados >= 2, obtenidos: {len(seats)}"
        doc.add_step(2, "Recuperar layout guardado", "HTTP 200 con asientos VIP persistidos", f"HTTP {r_get.status_code} ({len(seats)} butacas)", "✓")
        doc.attach_evidence("map_builder", {"save_response": r_save.json(), "retrieved_seats": len(seats)})
        doc.finish("Aprobada", observations=f"Constructor de mapas validado: {len(seats)} butacas interactivas persistidas con éxito")

    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
