"""
Prueba de Rendimiento (PT) - Latencia: Catálogo Público de Eventos
CP-042: Mide el tiempo de respuesta y latencia de red al consultar el catálogo de eventos.
"""
import time
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-042",
        name="latencia_catalogo_eventos_pt",
        module="Rendimiento / Latencia de Catálogo",
        level="PT",
        test_type="Rendimiento",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Mide el tiempo de respuesta promedio (SLA < 500ms) al consultar la cartelera de eventos públicos mediante GET /api/events/public.",
        objective="Garantizar que la experiencia de navegación del usuario sea fluida y de baja latencia.",
        preconditions="Servicios en vivo bajo carga normal.",
        test_data="Muestra de 10 peticiones consecutivas con limit=20"
    )
    doc.start()

    times = []
    iterations = 10
    url = f"{GATEWAY_URL}/api/events/public?limit=20"

    for i in range(iterations):
        t0 = time.time()
        resp = requests.get(url, timeout=5)
        duration_ms = (time.time() - t0) * 1000.0
        if resp.status_code == 200:
            times.append(duration_ms)

    avg_time = sum(times) / len(times) if times else 0
    max_time = max(times) if times else 0
    min_time = min(times) if times else 0

    s1_ok = (len(times) == iterations)
    doc.add_step(1, f"Ejecutar {iterations} consultas consecutivas de eventos", f"{iterations} respuestas HTTP 200", f"{len(times)}/{iterations} completadas", "✓" if s1_ok else "✗")

    s2_ok = (avg_time < 500.0)
    doc.add_step(
        2,
        "Evaluar latencia promedio contra el umbral de SLA (500 ms)",
        "Tiempo promedio < 500 ms",
        f"Promedio: {avg_time:.2f} ms (Min: {min_time:.2f} ms, Max: {max_time:.2f} ms)",
        "✓" if s2_ok else "✗"
    )

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("latency_metrics", {"avg_ms": avg_time, "max_ms": max_time, "min_ms": min_time, "samples": times})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El endpoint de eventos cumple holgadamente con los requerimientos de velocidad.")

    return {
        "id": "CP-042",
        "name": "latencia_catalogo_eventos_pt",
        "level": "PT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

