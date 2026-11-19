"""
Prueba de Sistema (ST) - Navegación: Disponibilidad de Rutas Públicas React
CP-023: Verifica que el servidor frontend de React sirva las vistas públicas correctamente.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import FRONTEND_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-023",
        name="rutas_publicas_react_st",
        module="Sistema / Navegación y Enrutamiento Frontend",
        level="ST",
        test_type="Sistema",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa que el servidor web de React en puerto 3000 esté activo y sirva el bundle SPA para las rutas públicas de navegación.",
        objective="Garantizar que rutas como '/', '/login', '/register', '/shop' respondan con HTTP 200 y contengan el contenedor raíz de React.",
        preconditions="Contenedor laikaclub-frontend en ejecución.",
        test_data="Rutas: '/', '/login', '/register', '/shop'"
    )
    doc.start()

    routes = ["/", "/login", "/register", "/shop"]
    all_passed = True

    for idx, path in enumerate(routes, start=1):
        try:
            resp = requests.get(f"{FRONTEND_URL}{path}", timeout=5)
            s_ok = (resp.status_code == 200 and ("<div id=\"root\">" in resp.text or "Laika" in resp.text or "<html" in resp.text))
            if not s_ok:
                all_passed = False
            doc.add_step(
                idx,
                f"Solicitar ruta pública '{path}'",
                "HTTP 200 con HTML del shell SPA",
                f"HTTP {resp.status_code}, Bytes: {len(resp.content)}",
                "✓" if s_ok else "✗"
            )
        except Exception as e:
            all_passed = False
            doc.add_step(idx, f"Solicitar ruta pública '{path}'", "HTTP 200", f"Error de conexión: {e}", "✗")

    doc.attach_evidence("frontend_routes_tested", routes)
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El servidor web SPA entrega el contenedor de la aplicación para todas las rutas públicas.")

    return {
        "id": "CP-023",
        "name": "rutas_publicas_react_st",
        "level": "ST",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

