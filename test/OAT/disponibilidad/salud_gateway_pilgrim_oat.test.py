"""
Prueba de Aceptación Operativa (OAT) - Disponibilidad: Salud de Pilgrim API Gateway
CP-035: Evalúa el estado operativo de Pilgrim Gateway (puerto 8000) y su mapa de microservicios.
"""
import sys
from pathlib import Path

TEST_ROOT = Path(__file__).resolve().parents[2]
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-035",
        name="salud_gateway_pilgrim_oat",
        module="OAT / Disponibilidad de Gateway",
        level="OAT",
        test_type="Operacional / Disponibilidad",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa el endpoint de salud de Pilgrim Gateway a través del HTTPS público de Azure.",
        objective="Verificar que el Gateway responda como saludable desde la ruta pública.",
        preconditions="Gateway accesible desde GATEWAY_URL.",
        test_data=f"GET {GATEWAY_URL}/api/health"
    )
    doc.start()

    try:
        h_resp = requests.get(f"{GATEWAY_URL}/api/health", timeout=10)
        try:
            health_data = h_resp.json()
        except ValueError:
            health_data = {}
        if not isinstance(health_data, dict):
            health_data = {}
        healthy = h_resp.status_code == 200 and health_data.get("status") == "healthy"
        obtained = f"HTTP {h_resp.status_code}, Payload: {health_data or h_resp.text[:200]}"
        doc.add_step(1, "Consultar /api/health por HTTPS", "HTTP 200 con status='healthy'", obtained, "✓" if healthy else "✗")
        doc.attach_evidence("gateway_health_payload", {"status_code": h_resp.status_code, "payload": health_data or h_resp.text[:500]})
        doc_status = "Aprobada" if healthy else "Fallida"
        doc.finish(doc_status, observations="Health check realizado por el endpoint público de Pilgrim Gateway.")
    except requests.RequestException as exc:
        doc.add_step(1, "Consultar /api/health por HTTPS", "HTTP 200 con status='healthy'", f"Error de conexión: {exc}", "✗")
        doc.attach_evidence("gateway_health_payload", {"error": str(exc)})
        doc_status = "Fallida"
        doc.finish(doc_status, observations="No fue posible conectar con Pilgrim Gateway.")

    return {
        "id": "CP-035",
        "name": "salud_gateway_pilgrim_oat",
        "level": "OAT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

