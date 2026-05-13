import urllib.request
from urllib.error import HTTPError
import json

try:
    urllib.request.urlopen("http://localhost:8007/api/analytics/ml/regression")
except HTTPError as e:
    print("HTTP ERROR:")
    print(e.read().decode())
except Exception as ex:
    print(f"Other Error: {ex}")
