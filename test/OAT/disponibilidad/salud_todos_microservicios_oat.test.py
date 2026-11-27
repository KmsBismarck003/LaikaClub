"""
Prueba de Aceptación Operativa (OAT) - Disponibilidad: Health Checks de Microservicios Core
CP-034: Verifica que cada microservicio Spring Boot exponga su endpoint /health operativo.
"""
import sys
from pathlib import Path

TEST_ROOT = Path(__file__).resolve().parents[2]
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import (
    AUTH_SERVICE_URL, ADMIN_SERVICE_URL, STATS_SERVICE_URL,
    EVENTS_SERVICE_URL, TICKETS_SERVICE_URL, MERCHANDISE_SERVICE_URL,
    ACHIEVEMENTS_SERVICE_URL, ANALYTICS_SERVICE_URL
)

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-034",
        name="salud_todos_microservicios_oat",
        module="OAT / Monitoreo y Salud de Microservicios",
        level="OAT",
        test_type="Operacional / Disponibilidad",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Audita los health checks de los microservicios por las rutas públicas de Pilgrim Gateway.",
        objective="Garantizar que los servicios expuestos reporten HTTP 200 a través de HTTPS.",
        preconditions="Gateway y rutas de microservicios accesibles desde GATEWAY_URL.",
        test_data="GET /api/{servicio}/health por HTTPS"
    )
    doc.start()

    services = [
        ("laika_auth", f"{AUTH_SERVICE_URL}/health"),
        ("laika_admin", f"{ADMIN_SERVICE_URL}/health"),
        ("laika_stats", f"{STATS_SERVICE_URL}/health"),
        ("laika_events", f"{EVENTS_SERVICE_URL}/health"),
        ("laika_tickets", f"{TICKETS_SERVICE_URL}/health"),
        ("laika_merchandise", f"{MERCHANDISE_SERVICE_URL}/health"),
        ("laika_achievements", f"{ACHIEVEMENTS_SERVICE_URL}/health"),
        ("laika_analytics", f"{ANALYTICS_SERVICE_URL}/health")
    ]

    all_passed = True
    evidences = {}

    for idx, (svc_name, url) in enumerate(services, start=1):
        try:
            resp = requests.get(url, timeout=5)
            s_ok = resp.status_code == 200
            try:
                data = resp.json() if s_ok else {}
            except ValueError:
                data = {}
            if not isinstance(data, dict):
                data = {}
            evidences[svc_name] = {"status_code": resp.status_code, "payload": data}
            if not s_ok:
                all_passed = False
            doc.add_step(
                idx,
                f"Health check de '{svc_name}' ({url})",
                "HTTP 200 OK con payload de salud",
                f"HTTP {resp.status_code}, Payload: {data.get('status') or data.get('service') or data}",
                "✓" if s_ok else "✗"
            )
        except Exception as e:
            all_passed = False
            evidences[svc_name] = {"error": str(e)}
            doc.add_step(idx, f"Health check de '{svc_name}' ({url})", "HTTP 200 OK", f"Error de conexión: {e}", "✗")

    doc.attach_evidence("microservices_health", evidences)
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="Los health checks se consultaron mediante las rutas públicas del Gateway.")

    return {
        "id": "CP-034",
        "name": "salud_todos_microservicios_oat",
        "level": "OAT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

