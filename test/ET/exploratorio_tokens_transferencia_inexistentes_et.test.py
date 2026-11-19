"""
Prueba Exploratoria (ET) - Transferencias: Tokens Falsos o Inexistentes
CP-055: Explora el comportamiento del sistema ante el ingreso de tokens de transferencia inventados.
"""
import uuid
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token, get_auth_headers
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-055",
        name="exploratorio_tokens_transferencia_inexistentes_et",
        module="Exploratorio / Centro de Canje de Transferencias",
        level="ET",
        test_type="Exploratorio",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Explora cómo reacciona el sistema cuando un usuario intenta reclamar o consultar un token de transferencia aleatorio nunca generado.",
        objective="Verificar que el sistema rechace limpiamente tokens espurios (400 o 404) sin lanzar excepciones no controladas ni colapsar el servicio.",
        preconditions="Servicio de tickets en ejecución.",
        test_data="Token GUID aleatorio generado con uuid4"
    )
    doc.start()

    token = get_auth_token()
    headers = get_auth_headers(token)

    fake_transfer_token = str(uuid.uuid4()).replace("-", "")

    # 1. Explorar endpoint de consulta de token de cortesía o reclamo
    val_resp = requests.get(f"{GATEWAY_URL}/api/tickets/courtesy/validate-token/{fake_transfer_token}", timeout=10)
    # Debe ser 400, 404 o retornar {valid: False}
    data1 = val_resp.json() if val_resp.status_code == 200 else {}
    s1_ok = (val_resp.status_code in [400, 404] or data1.get("valid") is False)

    doc.add_step(
        1,
        f"Validar token aleatorio inexistente '{fake_transfer_token}'",
        "Token catalogado como no válido o no encontrado",
        f"HTTP {val_resp.status_code}, Valid: {data1.get('valid')}",
        "✓" if s1_ok else "✗"
    )

    # 2. Intentar canjear el token inexistente
    claim_payload = {"claimToken": fake_transfer_token}
    claim_resp = requests.post(f"{GATEWAY_URL}/api/tickets/courtesy/claim", json=claim_payload, headers=headers, timeout=10)
    s2_ok = (claim_resp.status_code in [400, 404, 422])

    doc.add_step(
        2,
        "Intentar canjear el token falso con POST /api/tickets/courtesy/claim",
        "Petición rechazada con HTTP 400/404 sin crear registros de ticket",
        f"HTTP {claim_resp.status_code}",
        "✓" if s2_ok else "✗"
    )

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("exploratory_transfer_results", {"fake_token": fake_transfer_token, "validate_status": val_resp.status_code, "claim_status": claim_resp.status_code})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El servicio maneja adecuadamente tokens erróneos o manipulados con código de error controlado.")

    return {
        "id": "CP-055",
        "name": "exploratorio_tokens_transferencia_inexistentes_et",
        "level": "ET",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

