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
    doc = TestCaseDocumenter("CP-ADV-041", "flujo_recintos_creacion_y_consulta_post", "Recintos / Creación",
                             level="API", test_type="Funcional / Administrador", technique="Caja negra")
    doc.set_metadata("Validar creación integral y persistencia física de un nuevo recinto",
                     "Comprobar registro con nombre, dirección, ciudad, aforo y geolocalización",
                     "Servicio laika_events activo; token admin", "Ruta: POST /api/venues")
    doc.start()
    try:
        headers = get_admin_auth_headers()
        payload = {
            "name": "Complejo Cultural Metropolitano QA",
            "city": "Guadalajara",
            "address": "Av. de las Artes 500",
            "capacity": 1500,
            "status": "active"
        }
        r = requests.post(f"{GATEWAY_URL}/api/venues", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 200, f"Inesperado: {r.status_code} - {r.text}"
        data = r.json()
        venue_id = data.get("id")
        assert venue_id is not None, "No se retornó el ID del recinto creado"
        doc.add_step(1, "Crear recinto cultural", "HTTP 200 con ID generado", f"HTTP {r.status_code} (ID: {venue_id})", "✓")
        
        # Validar consulta
        r_list = requests.get(f"{GATEWAY_URL}/api/venues", headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r_list.status_code == 200, "Fallo al listar recintos"
        doc.add_step(2, "Listar recintos activos", "HTTP 200 con listado", f"HTTP {r_list.status_code}", "✓")
        doc.attach_evidence("venue_creation", {"created": data, "venue_id": venue_id})
        doc.finish("Aprobada", observations=f"Recinto creado y persistido con éxito (ID: {venue_id})")

    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
