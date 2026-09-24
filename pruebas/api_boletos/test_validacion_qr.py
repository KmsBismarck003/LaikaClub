import requests
import json

BASE_URL = "http://localhost:8000"

def login(email, password):
    url = f"{BASE_URL}/api/auth/login"
    try:
        response = requests.post(url, json={"email": email, "password": password}, timeout=5)
        if response.status_code == 200:
            return response.json().get("token")
    except Exception:
        pass
    return None

def test_validacion_qr():
    print("--- INICIANDO TEST: Validación de Boleto y Anti-Clonación (HU-02) ---")
    
    # 1. Login del usuario para comprar y obtener boleto
    token_user = login("gestor@laikaclub.com", "gearsof2")
    if not token_user:
        print("Fallo el login del usuario.")
        return

    # 2. Login del operador para escanear
    token_operator = login("operador@laikaclub.com", "gearsof2")
    if not token_operator:
        print("Fallo el login del operador.")
        return

    # En un escenario 100% E2E, aquí el usuario realizaría la compra de un boleto (POST /purchase).
    # Dado que no queremos alterar el historial real si no es necesario,
    # vamos a asumir que obtenemos el primer boleto disponible del usuario.
    print("[1] Obteniendo boletos activos del usuario...")
    headers_user = {"Authorization": f"Bearer {token_user}"}
    tickets_res = requests.get(f"{BASE_URL}/api/tickets/my-tickets", headers=headers_user)
    
    if tickets_res.status_code != 200:
        print(f"[ERROR] Error obteniendo boletos: {tickets_res.status_code} - {tickets_res.text}")
        return
        
    tickets = tickets_res.json()
    active_tickets = [t for t in tickets if t.get("status") == "unutilized"]
    
    if not active_tickets:
        print("[AVISO] El usuario de prueba no tiene boletos activos. Por favor compra un boleto manualmente o ejecuta el script de compra.")
        # Opcional: Podríamos automatizar la compra aquí mismo.
        return
        
    test_ticket = active_tickets[0]
    qr_code = test_ticket.get("qr_data") or test_ticket.get("qrData")
    ticket_id = test_ticket.get("id")
    print(f"Boleto seleccionado: ID {ticket_id} (QR: {qr_code[:10]}...)")

    # 3. Operador escanea el boleto (Validación 1: Éxito)
    print("\n[2] Operador escanea el boleto (Primer escaneo)")
    headers_operator = {"Authorization": f"Bearer {token_operator}", "Content-Type": "application/json"}
    verify_payload = {"ticketCode": qr_code, "context": "entry_gate_1"}
    
    verify_res1 = requests.post(f"{BASE_URL}/api/tickets/verify", json=verify_payload, headers=headers_operator)
    print(f"-> Respuesta Verificación 1: {verify_res1.status_code}")
    if verify_res1.status_code == 200:
        print("[OK] Boleto verificado como válido. Listo para redimir.")
    else:
        print(f"[ERROR] Error en la verificación: {verify_res1.text}")
        
    # 4. Operador marca el boleto como canjeado (Redeem)
    print("\n[3] Operador redime el boleto (Uso del boleto)")
    redeem_res = requests.post(f"{BASE_URL}/api/tickets/redeem", json=verify_payload, headers=headers_operator)
    print(f"-> Respuesta Redeem: {redeem_res.status_code}")
    if redeem_res.status_code == 200:
        print("[OK] Boleto redimido exitosamente.")
    else:
        print(f"[ERROR] Error al redimir: {redeem_res.text}")

    # 5. Clonador intenta escanear el MISMO código QR (Validación 2: Rechazo)
    print("\n[4] Intento de usar código clonado (Segundo escaneo del mismo QR)")
    verify_res2 = requests.post(f"{BASE_URL}/api/tickets/verify", json=verify_payload, headers=headers_operator)
    print(f"-> Respuesta Verificación 2 (Clon): {verify_res2.status_code}")
    
    # Asumimos que la API debe devolver 400 o 409 o al menos indicar en el JSON que ya fue usado.
    if verify_res2.status_code != 200 or verify_res2.json().get("valid") == False or verify_res2.json().get("status") == "used":
        print("[OK] Correcto: El sistema rechazó el QR clonado porque ya fue utilizado.")
    else:
        print(f"[ERROR] Fallo de seguridad: El sistema aceptó un QR que ya estaba redimido. {verify_res2.text}")


if __name__ == "__main__":
    test_validacion_qr()
