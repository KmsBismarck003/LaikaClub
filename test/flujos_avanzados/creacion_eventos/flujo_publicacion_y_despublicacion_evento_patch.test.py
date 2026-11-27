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
    doc = TestCaseDocumenter("CP-ADV-016", "flujo_publicacion_y_despublicacion_evento_patch", "Eventos / Publicación",
                             level="API", test_type="Funcional / Transición de Estado", technique="Caja negra")
    doc.set_metadata("Validar transición de estados: publicación (visible) y despublicación (borrador) de eventos",
                     "Comprobar visibilidad y ocultamiento dinámico de cartelera",
                     "Evento 100001 existente en laika_events", "Evento ID: 100001")
    doc.start()
    try:
        headers = get_gestor_auth_headers()
        event_id = 100001
        # Publicar
        r_pub = requests.patch(f"{GATEWAY_URL}/api/events/{event_id}/publish", headers=headers, timeout=TIMEOUT_DEFAULT)
        # Despublicar (volver a borrador)
        r_unpub = requests.patch(f"{GATEWAY_URL}/api/events/{event_id}/unpublish", headers=headers, timeout=TIMEOUT_DEFAULT)
        # Restaurar estado publicado
        requests.patch(f"{GATEWAY_URL}/api/events/{event_id}/publish", headers=headers, timeout=TIMEOUT_DEFAULT)
        
        doc.add_step(1, "Publicar evento", "HTTP 200 OK 'Evento publicado'", f"HTTP {r_pub.status_code}", "✓" if r_pub.status_code == 200 else "✗")
        doc.add_step(2, "Despublicar evento", "HTTP 200 OK 'Evento movido a borrador'", f"HTTP {r_unpub.status_code}", "✓" if r_unpub.status_code == 200 else "✗")
        assert r_pub.status_code == 200 and r_unpub.status_code == 200
        doc.attach_evidence("publish_cycle", {"pub": r_pub.json(), "unpub": r_unpub.json()})
        doc.finish("Aprobada", observations="Ciclo completo de publicación y despublicación validado")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
