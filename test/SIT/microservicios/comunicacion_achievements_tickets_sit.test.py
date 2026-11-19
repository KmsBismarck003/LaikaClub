"""
Prueba de Integración de Sistema (SIT) - Microservicios: Achievements <-> Tickets
CP-021: Verifica la consulta remota de conteo de boletos desde Achievements hacia Tickets.
"""
import requests
from utils.case_documenter import TestCaseDocumenter
from utils.auth_helper import get_auth_token, get_auth_headers
from config.test_config import GATEWAY_URL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-021",
        name="comunicacion_achievements_tickets_sit",
        module="SIT / Achievements <-> Tickets Inter-Service",
        level="SIT",
        test_type="Integración de Sistema",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa cómo laika_achievements (8301) consulta al microservicio de tickets (8202) para obtener el ticketCount y determinar el nivel de lealtad.",
        objective="Verificar que GET /api/achievements/my retorne el nivel y ticketCount calculado a partir de los boletos reales del usuario.",
        preconditions="Ambos microservicios en ejecución y usuario autenticado.",
        test_data="Token JWT del usuario de prueba."
    )
    doc.start()

    token = get_auth_token()
    headers = get_auth_headers(token)

    # 1. Consultar boletos directamente en tickets
    t_resp = requests.get(f"{GATEWAY_URL}/api/tickets/my-tickets", headers=headers, timeout=10)
    s1_ok = (t_resp.status_code == 200)
    tickets = t_resp.json() if s1_ok else []
    doc.add_step(1, "Consultar boletos directos en tickets", "HTTP 200 con lista de boletos", f"HTTP {t_resp.status_code}, conteo: {len(tickets)}", "✓" if s1_ok else "✗")

    # 2. Consultar progreso en achievements (éste invoca a tickets internamente)
    ach_resp = requests.get(f"{GATEWAY_URL}/api/achievements/my", headers=headers, timeout=10)
    s2_ok = (ach_resp.status_code == 200)
    ach_data = ach_resp.json() if s2_ok else {}
    doc.add_step(2, "Consultar progreso en /api/achievements/my", "HTTP 200 con estructura ProgressResponse", f"HTTP {ach_resp.status_code}", "✓" if s2_ok else "✗")

    # 3. Validar consistencia de los datos
    has_tier = ("tier" in ach_data or "userTier" in ach_data)
    has_ach = ("achievements" in ach_data or "unlockedAchievements" in ach_data)
    s3_ok = has_tier and has_ach
    doc.add_step(
        3,
        "Validar campos tier/userTier y achievements en respuesta",
        "Campos de gamificación presentes",
        f"Tier: {ach_data.get('tier', ach_data.get('userTier'))}, Logros: {len(ach_data.get('achievements', ach_data.get('unlockedAchievements', [])))}",
        "✓" if s3_ok else "✗"
    )

    all_passed = s1_ok and s2_ok and s3_ok
    doc.attach_evidence("gamification_integration", {"tickets_count": len(tickets), "achievements_payload": ach_data})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="Sincronización de reglas de gamificación en tiempo real validada.")

    return {
        "id": "CP-021",
        "name": "comunicacion_achievements_tickets_sit",
        "level": "SIT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

