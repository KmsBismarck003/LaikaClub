"""
Helper de autenticación para pruebas automatizadas.
Obtiene tokens JWT reales mediante el endpoint oficial /api/auth/login.
"""
import requests
from config.test_config import GATEWAY_URL, QA_USER_EMAIL, QA_USER_PASSWORD, QA_ADMIN_EMAIL, QA_ADMIN_PASSWORD, QA_GESTOR_EMAIL, QA_GESTOR_PASSWORD, QA_OPERADOR_EMAIL, QA_OPERADOR_PASSWORD

_CACHED_USER_TOKEN = None
_CACHED_ADMIN_TOKEN = None
_CACHED_GESTOR_TOKEN = None
_CACHED_OPERADOR_TOKEN = None

def get_auth_token(email=QA_USER_EMAIL, password=QA_USER_PASSWORD, force_refresh=False):
    global _CACHED_USER_TOKEN
    if _CACHED_USER_TOKEN and not force_refresh and email == QA_USER_EMAIL:
        return _CACHED_USER_TOKEN

    url = f"{GATEWAY_URL}/api/auth/login"
    payload = {"email": email, "password": password}
    resp = requests.post(url, json=payload, timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        token = data.get("token")
        if email == QA_USER_EMAIL:
            _CACHED_USER_TOKEN = token
        return token
    return None

def get_admin_auth_token(email=QA_ADMIN_EMAIL, password=QA_ADMIN_PASSWORD, force_refresh=False):
    global _CACHED_ADMIN_TOKEN
    if _CACHED_ADMIN_TOKEN and not force_refresh and email == QA_ADMIN_EMAIL:
        return _CACHED_ADMIN_TOKEN

    url = f"{GATEWAY_URL}/api/auth/login"
    payload = {"email": email, "password": password}
    resp = requests.post(url, json=payload, timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        token = data.get("token")
        if email == QA_ADMIN_EMAIL:
            _CACHED_ADMIN_TOKEN = token
        return token
    return None

def get_auth_headers(token=None):
    t = token or get_auth_token()
    headers = {"Content-Type": "application/json"}
    if t:
        headers["Authorization"] = f"Bearer {t}"
    return headers

def get_admin_auth_headers(token=None):
    t = token or get_admin_auth_token()
    headers = {"Content-Type": "application/json"}
    if t:
        headers["Authorization"] = f"Bearer {t}"
    return headers

def get_gestor_auth_token(email=QA_GESTOR_EMAIL, password=QA_GESTOR_PASSWORD, force_refresh=False):
    global _CACHED_GESTOR_TOKEN
    if _CACHED_GESTOR_TOKEN and not force_refresh and email == QA_GESTOR_EMAIL:
        return _CACHED_GESTOR_TOKEN

    url = f"{GATEWAY_URL}/api/auth/login"
    payload = {"email": email, "password": password}
    resp = requests.post(url, json=payload, timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        token = data.get("token")
        if email == QA_GESTOR_EMAIL:
            _CACHED_GESTOR_TOKEN = token
        return token
    return None

def get_gestor_auth_headers(token=None):
    t = token or get_gestor_auth_token()
    headers = {"Content-Type": "application/json"}
    if t:
        headers["Authorization"] = f"Bearer {t}"
    return headers

def get_operador_auth_token(email=QA_OPERADOR_EMAIL, password=QA_OPERADOR_PASSWORD, force_refresh=False):
    global _CACHED_OPERADOR_TOKEN
    if _CACHED_OPERADOR_TOKEN and not force_refresh and email == QA_OPERADOR_EMAIL:
        return _CACHED_OPERADOR_TOKEN

    url = f"{GATEWAY_URL}/api/auth/login"
    payload = {"email": email, "password": password}
    resp = requests.post(url, json=payload, timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        token = data.get("token")
        if email == QA_OPERADOR_EMAIL:
            _CACHED_OPERADOR_TOKEN = token
        return token
    return None

def get_operador_auth_headers(token=None):
    t = token or get_operador_auth_token()
    headers = {"Content-Type": "application/json"}
    if t:
        headers["Authorization"] = f"Bearer {t}"
    return headers

