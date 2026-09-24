import requests
import json
import uuid

BASE_URL = "http://localhost:8000"

def login(email, password):
    url = f"{BASE_URL}/api/auth/login"
    try:
        response = requests.post(url, json={"email": email, "password": password}, timeout=5)
        if response.status_code == 200:
            return response.json().get("token")
        print(f"Error login {email}: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"No se pudo conectar a {url} - {e}")
    return None

def test_bloqueo_asientos():
    print("--- INICIANDO TEST: Bloqueo de Asientos (HU-01) ---")
    
    # 1. Login del usuario normal
    token_user1 = login("gestor@laikaclub.com", "gearsof2")
    if not token_user1:
        print("Fallo el login, no se puede continuar con el test de reserva.")
        return

    headers_user1 = {"Authorization": f"Bearer {token_user1}", "Content-Type": "application/json"}
    
    # Simular datos de reserva
    test_event_id = 1
    test_function_id = 1
    test_seat_id = f"Z-{uuid.uuid4().hex[:4]}" # Un asiento aleatorio para la prueba

    # 2. Intentar bloquear el asiento
    print(f"[1] Usuario 1 intenta bloquear asiento: {test_seat_id}")
    lock_data = {
        "eventId": test_event_id,
        "functionId": test_function_id,
        "seatId": test_seat_id,
        "sectionName": "General",
        "price": 50.0
    }
    lock_url = f"{BASE_URL}/api/tickets/lock"
    
    lock_res1 = requests.post(lock_url, json=lock_data, headers=headers_user1)
    print(f"-> Respuesta Bloqueo Usuario 1: {lock_res1.status_code}")
    
    if lock_res1.status_code == 200:
        print("[OK] Asiento bloqueado exitosamente.")
    else:
        print(f"[ERROR] Error al bloquear asiento: {lock_res1.text}")
        return

    # 3. Validar concurrencia (Usuario 2 intenta bloquear el mismo asiento)
    print(f"\n[2] Usuario 2 (admin) intenta bloquear el MISMO asiento: {test_seat_id}")
    token_user2 = login("admin@laikaclub.com", "gearsof2")
    headers_user2 = {"Authorization": f"Bearer {token_user2}", "Content-Type": "application/json"}
    
    lock_res2 = requests.post(lock_url, json=lock_data, headers=headers_user2)
    print(f"-> Respuesta Bloqueo Usuario 2: {lock_res2.status_code}")
    
    if lock_res2.status_code in [409, 400]:
        print("[OK] Correcto: El sistema NO permitió que el usuario 2 bloqueara un asiento ya reservado.")
    else:
        print(f"[ERROR] Fallo de concurrencia: {lock_res2.status_code} - {lock_res2.text}")

    # 4. Liberar el asiento (limpiar)
    print(f"\n[3] Limpieza: Liberando el asiento...")
    unlock_res = requests.delete(lock_url, json=lock_data, headers=headers_user1)
    if unlock_res.status_code == 200:
        print("[OK] Asiento liberado.")
    else:
        print(f"[AVISO] Aviso: No se pudo liberar: {unlock_res.text}")


if __name__ == "__main__":
    print("Verificando que el backend Gateway está activo...")
    try:
        req = requests.get(f"{BASE_URL}/api/tickets/health")
        print("Estado del servicio de tickets:", req.status_code)
        test_bloqueo_asientos()
    except requests.exceptions.ConnectionError:
        print("[ERROR] ERROR: El servidor local (puerto 8000) no parece estar en ejecución.")
        print("Por favor levanta el entorno de Docker o microservicios (por ejemplo: docker-compose up) para ejecutar estas pruebas reales.")
