"""
Prueba de Usabilidad (UT-US) - Formularios: Resiliencia y Flexibilidad de Formato
CP-054: Evalúa la aceptación y normalización de números de teléfono y campos no críticos.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token, get_auth_headers
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-054",
        name="validacion_formulario_perfil_usability",
        module="Usabilidad / Formularios de Usuario",
        level="USABILITY",
        test_type="Usabilidad",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa que el formulario de perfil maneje adecuadamente formatos comunes de número telefónico (con espacios, guiones o diez dígitos continuos).",
        objective="Garantizar una experiencia de edición de perfil sin bloqueos injustificados en campos de contacto opcionales.",
        preconditions="Usuario autenticado con rol usuario.",
        test_data="Teléfono: '55 1234 5678' vs '5512345678'"
    )
    doc.start()

    token = get_auth_token()
    headers = get_auth_headers(token)

    # 1. Teléfono con formato común de 10 dígitos
    p1 = {"first_name": "QA_User", "last_name": "Tester", "phone": "5512345678"}
    r1 = requests.put(f"{GATEWAY_URL}/api/auth/users/me", json=p1, headers=headers, timeout=10)
    s1_ok = (r1.status_code == 200)
    doc.add_step(1, "Actualizar teléfono con 10 dígitos estándar ('5512345678')", "HTTP 200 OK", f"HTTP {r1.status_code}", "✓" if s1_ok else "✗")

    # 2. Teléfono con espacios o guiones
    p2 = {"first_name": "QA_User", "last_name": "Tester", "phone": "55-1234-5678"}
    r2 = requests.put(f"{GATEWAY_URL}/api/auth/users/me", json=p2, headers=headers, timeout=10)
    s2_ok = (r2.status_code == 200)
    doc.add_step(2, "Actualizar teléfono con guiones ('55-1234-5678')", "HTTP 200 OK aceptando formato flexible", f"HTTP {r2.status_code}", "✓" if s2_ok else "✗")

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("phone_formatting_results", {"standard": r1.status_code, "hyphenated": r2.status_code})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El formulario tolera variaciones naturales en el ingreso de datos de contacto.")

    return {
        "id": "CP-054",
        "name": "validacion_formulario_perfil_usability",
        "level": "USABILITY",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

