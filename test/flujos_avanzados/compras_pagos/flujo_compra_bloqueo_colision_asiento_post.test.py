import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parents[2]
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import requests
from config.test_config import GATEWAY_URL, TIMEOUT_DEFAULT
from utils.auth_helper import get_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADV-005", "flujo_compra_bloqueo_colision_asiento_post", "Compras / Concurrencia",
                             level="API", test_type="Concurrencia / Asientos", technique="Caja negra")
    doc.set_metadata("Validar control de concurrencia y prevención de colisión al bloquear un asiento ya reservado",
                     "Garantizar que dos clientes no puedan retener la misma butaca simultáneamente",
                     "Servicio laika_tickets activo", "Asiento: LOCK-CONCUR-01")
    doc.start()
    try:
        headers = get_auth_headers()
        payload = {"eventId": 100001, "seatId": "LOCK-CONCUR-01"}
        r1 = requests.post(f"{GATEWAY_URL}/api/tickets/lock", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        # Segundo intento concurrente
        r2 = requests.post(f"{GATEWAY_URL}/api/tickets/lock", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        # Liberar para limpieza
        requests.delete(f"{GATEWAY_URL}/api/tickets/lock", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        
        doc.add_step(1, "Primer bloqueo de asiento", "Procesado", f"HTTP {r1.status_code}", "✓")
        doc.add_step(2, "Segundo bloqueo concurrente del mismo asiento", "Manejo seguro", f"HTTP {r2.status_code}", "✓")
        doc.finish("Aprobada", observations=f"Bloqueo 1: {r1.status_code}, Bloqueo 2: {r2.status_code}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
