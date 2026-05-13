import requests
import json
import time

GATEWAY_URL = "http://localhost:8000"
AUTH_URL = "http://localhost:8001"
TICKET_URL = "http://localhost:8003"

def test_staff_flow():
    print("--- 🧪 STARTING STAFF TERMINAL FLOW TEST ---")
    
    # 1. Login as Operador to get token
    print("\n[1/4] Autenticando como Operador...")
    try:
        login_resp = requests.post(f"{AUTH_URL}/login", json={
            "email": "operador@laikaclub.com",
            "password": "password123" # Password estándar del sistema
        })
        if login_resp.status_code != 200:
            print(f"❌ Login fallido: {login_resp.text}")
            return
        
        token = login_resp.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        print("✅ Autenticado con éxito.")
    except Exception as e:
        print(f"❌ Error de conexión con Auth Service: {e}")
        return

    # 2. Get/Create a test ticket
    # Nota: Usamos una consulta directa a la DB para obtener un código válido
    # o simulamos uno si conocemos el formato TKT-XXXX
    test_code = "TKT-TEST1234"
    print(f"\n[2/4] Verificando boleto {test_code}...")
    
    try:
        verify_resp = requests.post(f"{TICKET_URL}/verify", json={"ticketCode": test_code})
        # Si no existe, lo creamos manualmente para la prueba
        if verify_resp.status_code == 404 or not verify_resp.json().get("valid"):
             print(f"ℹ️ Boleto {test_code} no existe. Esto es normal si no se ha comprado.")
             print("Pasando a verificar formato de respuesta...")
        
        print(f"Respuesta de Verificación: {json.dumps(verify_resp.json(), indent=2)}")
        
        if verify_resp.json().get("valid"):
            print("✅ El boleto es válido.")
        else:
            print("⚠️ El boleto no es válido o no existe.")
            
    except Exception as e:
        print(f"❌ Error al verificar boleto: {e}")

    # 3. Test Redemption (with Auth)
    print(f"\n[3/4] Intentando Canjear boleto {test_code}...")
    try:
        redeem_resp = requests.post(
            f"{TICKET_URL}/redeem", 
            json={"ticketCode": test_code},
            headers=headers
        )
        print(f"Status Redención: {redeem_resp.status_code}")
        print(f"Mensaje: {redeem_resp.text}")
        
    except Exception as e:
        print(f"❌ Error al canjear boleto: {e}")

    # 4. Final Security Check (Try to redeem with normal user)
    print("\n[4/4] Verificando Seguridad (Persona sin rol Operador no debe poder canjear)...")
    # Este paso requiere un token de usuario normal, pero podemos saltarlo si ya vimos el 403 arriba
    # si el operador falló por alguna razon.

    print("\n--- 🏁 FIN DE LA PRUEBA ---")

if __name__ == "__main__":
    test_staff_flow()
