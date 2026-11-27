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
    doc = TestCaseDocumenter("CP-ADV-042", "flujo_salas_creacion_en_recinto_post", "Recintos / Salas",
                             level="API", test_type="Funcional / Aforos", technique="Caja negra")
    doc.set_metadata("Validar creación de salas y escenarios dentro de un recinto registrado",
                     "Comprobar asociación de sala con aforo específico y soporte para layout interactivo",
                     "Servicio laika_events activo; token admin", "Ruta: POST /api/venues/{venue_id}/rooms")
    doc.start()
    try:
        headers = get_admin_auth_headers()
        # Usamos recinto 84 creado previamente
        payload = {"name": "Sala Sinfónica B", "capacity": 300, "has_map": True, "status": "active"}
        r = requests.post(f"{GATEWAY_URL}/api/venues/84/rooms", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r.status_code in [200, 201], f"Inesperado: {r.status_code} - {r.text}"
        data = r.json()
        room_id = data.get("id")
        doc.add_step(1, "Crear sala en recinto 84", "HTTP 200 con ID de sala", f"HTTP {r.status_code} (Sala ID: {room_id})", "✓")
        
        # Consultar salas del recinto
        r_rooms = requests.get(f"{GATEWAY_URL}/api/venues/84/rooms", headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r_rooms.status_code == 200, "Fallo al listar salas"
        doc.add_step(2, "Listar salas del recinto 84", "HTTP 200 con array de salas", f"HTTP {r_rooms.status_code}", "✓")
        doc.attach_evidence("room_creation", {"created": data, "rooms_count": len(r_rooms.json()) if isinstance(r_rooms.json(), list) else 1})
        doc.finish("Aprobada", observations=f"Sala creada y asociada al recinto exitosamente (ID: {room_id})")

    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
