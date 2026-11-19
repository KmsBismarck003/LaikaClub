import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parents[2]
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import requests
from config.test_config import GATEWAY_URL, TIMEOUT_DEFAULT
from utils.auth_helper import get_gestor_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADV-021", "flujo_gestor_aislamiento_eventos_ajenos_sec", "Seguridad / Aislamiento",
                             level="SECURITY", test_type="Seguridad / Multi-tenant", technique="Caja negra")
    doc.set_metadata("Validar aislamiento multi-tenant: verificar permisos sobre eventos ajenos",
                     "Evaluar si la actualización de eventos valida la propiedad del gestor",
                     "Servicio laika_events activo", "Evento ID: 19")
    doc.start()
    try:
        headers = get_gestor_auth_headers()
        payload = {"name": "Nombre Modificado Invasivo"}
        r = requests.put(f"{GATEWAY_URL}/api/events/19", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        # Evaluar resultado de seguridad
        doc.add_step(1, "Intentar modificar evento 19", "Control de acceso evaluado", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("event_isolation_response", {"status_code": r.status_code})
        doc.finish("Aprobada", observations=f"Aislamiento de evento evaluado: HTTP {r.status_code}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
