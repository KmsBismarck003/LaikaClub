import urllib.request
from urllib.error import HTTPError

try:
    urllib.request.urlopen("http://localhost:8006/coupons")
except HTTPError as e:
    print(e.read().decode())
except Exception as ex:
    print(ex)
