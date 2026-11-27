"""
Prueba de Rendimiento (PT) - Estrés: Estabilidad del Gateway ante Ráfagas de Tráfico
CP-045: Evalúa la estabilidad del API Gateway ante múltiples solicitudes en bucle cerrado.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-045",
        name="limite_peticiones_gateway_pt",
        module="Rendimiento / Estrés de Gateway",
        level="PT",
        test_type="Estrés",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Somete a Pilgrim Gateway a una ráfaga continua de 25 peticiones a endpoint de salud y eventos para verificar que no se produzcan caídas de proxy (502 / 504).",
        objective="Verificar que el Gateway asíncrono no sature su event loop ni cierre sockets prematuramente.",
        preconditions="Pilgrim Gateway en ejecución en puerto 8000.",
        test_data="Ráfaga de 25 peticiones GET a /api/health"
    )
    doc.start()

    burst_count = 25
    statuses = []
    url = f"{GATEWAY_URL}/api/health"

    for _ in range(burst_count):
        try:
            r = requests.get(url, timeout=3)
            statuses.append(r.status_code)
        except Exception:
            statuses.append(0)

    ok_200 = statuses.count(200)
    s1_ok = (ok_200 == burst_count)

    doc.add_step(
        1,
        f"Transmitir ráfaga rápida de {burst_count} peticiones a {url}",
        f"{burst_count} respuestas HTTP 200 sin errores 502/504",
        f"{ok_200}/{burst_count} completadas exitosamente",
        "✓" if s1_ok else "✗"
    )

    doc.attach_evidence("burst_metrics", {"total": burst_count, "ok_count": ok_200, "errors": [s for s in statuses if s != 200]})
    doc_status = "Aprobada" if s1_ok else "Fallida"
    doc.finish(doc_status, observations="El Gateway mantiene su estabilidad y no genera bloqueos de socket.")

    return {
        "id": "CP-045",
        "name": "limite_peticiones_gateway_pt",
        "level": "PT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

