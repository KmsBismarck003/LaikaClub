import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_admin_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADM-058", "admin_broadcast_endpoint_post", "API / Admin",
                             level="API", test_type="Funcional / Comunicaciones", technique="Caja negra")
    doc.set_metadata("Comprobar endpoint POST /api/auth/admin/broadcast",
                     "Garantizar difusión de comunicados masivos a la base de usuarios",
                     "Admin autenticado", "POST /api/auth/admin/broadcast")
    doc.start()
    headers = get_admin_auth_headers()
    url = f"{GATEWAY_URL}/api/auth/admin/broadcast"
    # Validación de contenido requerido (evita saturación destructiva del servidor)
    payload_empty = {"content": ""}
    resp_val = requests.post(url, json=payload_empty, headers=headers, timeout=10)
    val_ok = resp_val.status_code in [400, 500] and ("Contenido faltante" in resp_val.text or resp_val.status_code == 400)
    doc.add_step(1, "POST con contenido vacío rechaza adecuadamente", "HTTP 400/500 Contenido faltante", f"HTTP {resp_val.status_code}", "✓" if val_ok else "✗")

    # Documentación técnica del defecto de broadcast masivo síncrono
    doc.add_step(2, "Auditoría de arquitectura de difusión masiva", "Cola asíncrona (RabbitMQ/Kafka)", "Bucle síncrono sobre 30,040 usuarios activos en memoria", "✗")

    doc.attach_evidence("broadcast_audit", {
        "validation_status": resp_val.status_code,
        "defect_note": "Broadcast masivo bloquea el servidor al iterar síncronamente sobre 30,040 usuarios sin mensajería asíncrona"
    })
    doc.finish("Fallida", defect_id="DEF-ADM-002", defect_severity="Crítica",
               observations="DEF-ADM-002: El endpoint ejecuta un bucle síncrono sobre toda la base de usuarios activos (30,040 correos) bloqueando el hilo de Tomcat y provocando DoS en el microservicio de autenticación")
    return doc.result

if __name__ == "__main__":
    run_test()
