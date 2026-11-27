"""
Prueba de Aceptación Operativa (OAT) - Despliegue: Auditoría de Puertos TCP en Escucha
CP-038: Verifica la disponibilidad y apertura de todos los puertos de red del ecosistema.
"""
import sys
from pathlib import Path
from urllib.parse import urlparse

TEST_ROOT = Path(__file__).resolve().parents[2]
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

import socket
from utils.case_documenter import TestCaseDocumenter
from config.test_config import GATEWAY_URL

def check_socket_port(host, port, timeout=2.0):
    try:
        with socket.create_connection((host, port), timeout=timeout):
            pass
        return True
    except OSError:
        return False

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-038",
        name="verificacion_puertos_activos_oat",
        module="OAT / Infraestructura y Puertos de Red",
        level="OAT",
        test_type="Operacional / Red",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Verifica que el único punto de entrada público HTTPS acepte conexiones TCP.",
        objective="Confirmar la disponibilidad del puerto HTTPS expuesto por Azure sin sondear puertos internos.",
        preconditions="GATEWAY_URL apunta al host público del sistema.",
        test_data=f"Conexión TCP a {GATEWAY_URL}"
    )
    doc.start()

    parsed_url = urlparse(GATEWAY_URL)
    port = parsed_url.port or (443 if parsed_url.scheme == "https" else 80)
    valid_target = parsed_url.scheme == "https" and port == 443 and parsed_url.hostname is not None
    try:
        is_open = valid_target and check_socket_port(parsed_url.hostname, port)
        obtained = "Puerto 443 accesible" if is_open else "El host no expone el puerto HTTPS 443 esperado"
    except OSError as exc:
        is_open = False
        obtained = f"Error de conexión TCP: {exc}"

    doc.add_step(1, f"Verificar TCP 443 en {parsed_url.hostname or 'host no configurado'}",
                 "Conexión TCP aceptada en HTTPS 443", obtained, "✓" if is_open else "✗")
    doc.attach_evidence("public_https_port", {
        "host": parsed_url.hostname,
        "port": port,
        "scheme": parsed_url.scheme,
        "open": is_open
    })
    doc_status = "Aprobada" if is_open else "Fallida"
    doc.finish(doc_status, observations="Solo se verificó el puerto público HTTPS; no se sondearon puertos internos.")

    return {
        "id": "CP-038",
        "name": "verificacion_puertos_activos_oat",
        "level": "OAT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

