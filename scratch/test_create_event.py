
import requests
import json

URL = "http://127.0.0.1:8002/manager/events"

payload = {
    "name": "Evento de Prueba",
    "description": "Prueba desde script",
    "category": "concert",
    "event_date": "2026-06-01",
    "event_time": "20:00",
    "location": "Puebla",
    "venue": "Recinto de Prueba",
    "venue_id": 1,
    "total_tickets": 100,
    "available_tickets": 100,
    "price": 500.0,
    "image_url": "https://example.com/image.png",
    "status": "draft",
    "functions": [
        {
            "date": "2026-06-01",
            "time": "20:00",
            "venue_id": 1
        }
    ]
}

try:
    response = requests.post(URL, json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
