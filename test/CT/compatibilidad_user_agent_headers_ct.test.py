"""
Prueba de Compatibilidad (CT) - Clientes y Navegadores: Soporte de User-Agents
CP-051: Verifica la compatibilidad del ecosistema ante peticiones simuladas de distintos navegadores y plataformas.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-051",
        name="compatibilidad_user_agent_headers_ct",
        module="Compatibilidad / Multi-Plataforma y Navegadores",
        level="CT",
        test_type="Compatibilidad",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa que el API Gateway y los microservicios procesen correctamente peticiones con cabeceras User-Agent de Chrome, Safari, Firefox y dispositivos móviles.",
        objective="Garantizar que no existan filtros restrictivos ni bloqueos indebidos basados en el agente de usuario.",
        preconditions="Servicios activos en puerto 8000.",
        test_data="User-Agents: Chrome Desktop, Safari macOS, Firefox Linux, iPhone Safari, Android Chrome"
    )
    doc.start()

    user_agents = [
        ("Chrome Desktop", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"),
        ("Safari macOS", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15"),
        ("Firefox Linux", "Mozilla/5.0 (X11; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0"),
        ("iPhone Safari", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1"),
        ("Android Chrome", "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36")
    ]

    all_passed = True
    evidences = {}

    for idx, (platform, ua_string) in enumerate(user_agents, start=1):
        headers = {"User-Agent": ua_string}
        resp = requests.get(f"{GATEWAY_URL}/api/events/public?limit=1", headers=headers, timeout=5)
        s_ok = (resp.status_code == 200)
        evidences[platform] = {"status_code": resp.status_code, "ua": ua_string[:40]}
        if not s_ok:
            all_passed = False
        doc.add_step(
            idx,
            f"Consultar catálogo con User-Agent de {platform}",
            "HTTP 200 OK sin bloqueos de agente",
            f"HTTP {resp.status_code}",
            "✓" if s_ok else "✗"
        )

    doc.attach_evidence("user_agents_evaluated", evidences)
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El Gateway procesa con neutralidad solicitudes de diversos sistemas operativos y clientes.")

    return {
        "id": "CP-051",
        "name": "compatibilidad_user_agent_headers_ct",
        "level": "CT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

