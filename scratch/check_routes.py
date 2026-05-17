import sys
import os

# Add the project root to sys.path
sys.path.append(os.getcwd())

try:
    from microservices.events.main import app
    print("Routes registered in Event Service:")
    for route in app.routes:
        methods = getattr(route, 'methods', [])
        print(f"{list(methods)} {route.path}")
except Exception as e:
    print(f"Error: {e}")
