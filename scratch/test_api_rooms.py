
import requests
import json

# Through Gateway
URL = "http://127.0.0.1:8000/api/venues/1/rooms"

try:
    response = requests.get(URL)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
