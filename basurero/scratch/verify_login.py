import requests
import json

def test_login():
    url = "http://localhost:8001/login"
    payload = {
        "email": "admin@laikaclub.com",
        "password": "admin123"
    }
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, data=json.dumps(payload), headers=headers, timeout=5)
        if response.status_code == 200:
            print("[VERIFY] Login successful! Token received.")
            print(response.json())
        else:
            print(f"[VERIFY] Login failed with status {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"[VERIFY] Error connecting to auth service: {e}")

if __name__ == "__main__":
    test_login()
