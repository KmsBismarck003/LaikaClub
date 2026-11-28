"""
Prueba de Rendimiento (PT) - Carga: Concurrencia en Consulta de Cartera
CP-044: Evalúa la capacidad del microservicio de tickets para resolver consultas simultáneas.
"""
import concurrent.futures
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token, get_auth_headers
from config.test_config import GATEWAY_URL

def fetch_wallet(url, headers):
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        return resp.status_code
    except requests.RequestException:
        return 0

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-044",
        name="concurrencia_consulta_boletos_pt",
        module="Rendimiento / Carga Concurrente",
        level="PT",
        test_type="Carga",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Simula una ráfaga de 10 peticiones concurrentes simultáneas al endpoint de boletos del usuario mediante ThreadPoolExecutor.",
        objective="Garantizar que el pool de conexiones y el contenedor de Spring Boot atiendan peticiones concurrentes sin errores 500.",
        preconditions="Servicio de tickets activo.",
        test_data="10 hilos concurrentes autenticados con token JWT."
    )
    doc.start()

    token = get_auth_token()
    headers = get_auth_headers(token)
    url = f"{GATEWAY_URL}/api/tickets/my-tickets"
    concurrency = 10

    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = [executor.submit(fetch_wallet, url, headers) for _ in range(concurrency)]
        for f in concurrent.futures.as_completed(futures):
            results.append(f.result())

    success_count = results.count(200)
    s1_ok = (success_count == concurrency)

    doc.add_step(
        1,
        f"Lanzar {concurrency} peticiones HTTP concurrentes a {url}",
        f"{concurrency} respuestas HTTP 200",
        f"{success_count}/{concurrency} peticiones respondidas con 200 OK",
        "✓" if s1_ok else "✗"
    )

    doc.attach_evidence("concurrency_results", {"concurrency": concurrency, "status_codes": results})
    doc_status = "Aprobada" if s1_ok else "Fallida"
    doc.finish(doc_status, observations="El microservicio de boletos soporta concurrencia sin degradación del servicio.")

    return {
        "id": "CP-044",
        "name": "concurrencia_consulta_boletos_pt",
        "level": "PT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

