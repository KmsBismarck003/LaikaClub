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
    doc = TestCaseDocumenter("CP-ADV-038", "flujo_bigdata_vault_status_get", "Big Data / Bóveda NoSQL",
                             level="API", test_type="Infraestructura / MongoDB Vault", technique="Caja negra")
    doc.set_metadata("Validar estado de conexión de la Bóveda NoSQL MongoDB Atlas para snapshots históricos",
                     "Comprobar disponibilidad de persistencia documental para analítica predictiva",
                     "Servicio laika_analytics_bigdata activo", "Ruta: GET /api/analytics/vault/status")
    doc.start()
    try:
        r = requests.get(f"{GATEWAY_URL}/api/analytics/vault/status", timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 200, f"Status inesperado: {r.status_code}"
        data = r.json()
        assert data.get("status") == "ready", f"Estado inesperado de Vault: {data}"
        doc.add_step(1, "Consultar estado de MongoDB Vault", "HTTP 200 con status ready", f"HTTP {r.status_code} ({data.get('status')})", "✓")
        doc.attach_evidence("vault_status", data)
        doc.finish("Aprobada", observations=f"Bóveda MongoDB Atlas conectada y lista (database: {data.get('database')})")

    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
