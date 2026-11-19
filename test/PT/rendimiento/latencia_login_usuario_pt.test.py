"""
Prueba de Rendimiento (PT) - Latencia: Autenticación y Emisión de JWT
CP-043: Mide el tiempo de respuesta del proceso de verificación de credenciales con hashing BCrypt.
"""
import time
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL, QA_USER_EMAIL, QA_USER_PASSWORD

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-043",
        name="latencia_login_usuario_pt",
        module="Rendimiento / Latencia de Autenticación",
        level="PT",
        test_type="Rendimiento",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Mide el tiempo de respuesta total del login (incluyendo la verificación del hash BCrypt y la emisión del token JWT) con umbral SLA < 1000ms.",
        objective="Garantizar que la seguridad criptográfica no penalice excesivamente la experiencia de inicio de sesión.",
        preconditions="Servicio de autenticación en línea.",
        test_data="Muestra de 5 inicios de sesión con credenciales válidas"
    )
    doc.start()

    times = []
    iterations = 5
    url = f"{GATEWAY_URL}/api/auth/login"
    payload = {"email": QA_USER_EMAIL, "password": QA_USER_PASSWORD}

    for i in range(iterations):
        t0 = time.time()
        resp = requests.post(url, json=payload, timeout=10)
        duration_ms = (time.time() - t0) * 1000.0
        if resp.status_code == 200:
            times.append(duration_ms)

    avg_time = sum(times) / len(times) if times else 0
    max_time = max(times) if times else 0

    s1_ok = (len(times) == iterations)
    doc.add_step(1, f"Ejecutar {iterations} autenticaciones consecutivas", f"{iterations} respuestas HTTP 200", f"{len(times)}/{iterations} completadas", "✓" if s1_ok else "✗")

    s2_ok = (avg_time < 1000.0)
    doc.add_step(
        2,
        "Evaluar latencia de login contra umbral de SLA (1000 ms)",
        "Tiempo promedio < 1000 ms",
        f"Promedio: {avg_time:.2f} ms (Máximo: {max_time:.2f} ms)",
        "✓" if s2_ok else "✗"
    )

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("auth_latency_metrics", {"avg_ms": avg_time, "samples": times})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El coste computacional de BCrypt se encuentra dentro de parámetros aceptables.")

    return {
        "id": "CP-043",
        "name": "latencia_login_usuario_pt",
        "level": "PT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

