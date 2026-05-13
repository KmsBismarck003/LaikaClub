import sys
print(sys.executable)
try:
    import requests
    print("requests imported successfully")
except ImportError as e:
    print(f"Error importing requests: {e}")

try:
    from google.auth.transport import requests as google_requests
    print("google.auth.transport.requests imported successfully")
except ImportError as e:
    print(f"Error importing google auth requests: {e}")
