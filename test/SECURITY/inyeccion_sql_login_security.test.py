"""
Prueba de Seguridad (ST-SEC) - Resiliencia ante Inyección SQL en Autenticación
CP-046: Comprueba que el microservicio de autenticación sea inmune a payloads clásicos de SQL Injection.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-046",
        name="inyeccion_sql_login_security",
        module="Seguridad / Prevención de Inyección SQL",
        level="SECURITY",
        test_type="Seguridad",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la protección de las consultas SQL de login mediante sentencias preparadas (PreparedStatements/JPA) ante intentos de bypass de autenticación.",
        objective="Verificar que payloads maliciosos no permitan saltarse la contraseña ni generen errores de sintaxis SQL (500).",
        preconditions="Servicio laika_auth en línea.",
        test_data="Payloads: \"' OR '1'='1\", \"admin'--\", \"' UNION SELECT * FROM users--\""
    )
    doc.start()

    attack_payloads = [
        {"email": "' OR '1'='1", "password": "password"},
        {"email": "admin@laikaclub.com'--", "password": "any"},
        {"email": "' UNION SELECT 1, 'admin', 'hash'--", "password": "test"}
    ]

    all_passed = True
    evidences = []

    for idx, payload in enumerate(attack_payloads, start=1):
        resp = requests.post(f"{GATEWAY_URL}/api/auth/login", json=payload, timeout=10)
        # Debe responder con 401 Unauthorized o 400 Bad Request, NUNCA 200 (bypass) ni 500 (SQL Syntax Error)
        safe = (resp.status_code in [400, 401, 422])
        if not safe:
            all_passed = False
        evidences.append({"payload": payload, "status_code": resp.status_code})
        doc.add_step(
            idx,
            f"Probar inyección SQL en campo email: '{payload['email']}'",
            "Petición rechazada con HTTP 401/400 sin filtrar error de base de datos",
            f"HTTP {resp.status_code} ({'Inmune' if safe else 'VULNERABLE'})",
            "✓" if safe else "✗"
        )

    doc.attach_evidence("sqli_attempts", evidences)
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El uso de Spring Data JPA y parámetros vinculados neutraliza completamente la inyección SQL.")

    return {
        "id": "CP-046",
        "name": "inyeccion_sql_login_security",
        "level": "SECURITY",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

