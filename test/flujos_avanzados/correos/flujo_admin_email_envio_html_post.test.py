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
    doc = TestCaseDocumenter("CP-ADV-052", "flujo_admin_email_envio_html_post", "Mensajería / Correos",
                             level="API", test_type="Funcional / Notificaciones SMTP", technique="Caja negra")
    doc.set_metadata("Validar procesamiento y despacho de correos electrónicos con formato HTML por administrador",
                     "Comprobar manejo controlado ante servidores SMTP locales y reporte de estatus",
                     "Servicio laika_admin activo; credenciales admin", "Ruta: POST /api/admin/emails/send")
    doc.start()
    try:
        headers = get_admin_auth_headers()
        payload = {
            "email": "auditoria_qa@laikaclub.com",
            "subject": "Notificación de Auditoría Integral QA",
            "htmlContent": "<h1>Reporte de Calidad</h1><p>Todas las pruebas fueron ejecutadas.</p>"
        }
        r = requests.post(f"{GATEWAY_URL}/api/admin/emails/send", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 200, f"Inesperado: {r.status_code} - {r.text}"
        data = r.json()
        assert data.get("status") in ["success", "simulated"], f"Estado de envío inesperado: {data}"
        doc.add_step(1, "Enviar correo HTML desde consola admin", "HTTP 200 con estado success o simulated", f"HTTP {r.status_code} ({data.get('status')})", "✓")
        doc.attach_evidence("email_send", data)
        doc.finish("Aprobada", observations=f"Envío de correos evaluado: HTTP 200 ({data.get('message')})")

    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
