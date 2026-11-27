import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_admin_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADM-042", "soporte_utf8_en_anuncios_y_broadcast_ct", "CT / Admin",
                             level="CT", test_type="Compatibilidad / Encoding", technique="Caja negra")
    doc.set_metadata("Comprobar soporte UTF-8 con caracteres multilingües y acentos en ticker",
                     "Garantizar que no se corrompan caracteres como á, é, í, ó, ú, ñ, ¿, ¡ en anuncios",
                     "Admin autenticado", "POST /api/config/ticker")
    doc.start()
    headers = get_admin_auth_headers()
    utf8_text = "¡Atención administradores! Éxito total en México con señal acústica 🚀 2026."
    url = f"{GATEWAY_URL}/api/config/ticker"
    resp = requests.post(url, json={"content": utf8_text, "enabled": True}, headers=headers, timeout=10)
    status_ok = resp.status_code == 200

    r_get = requests.get(url, headers=headers, timeout=10)
    saved_text = r_get.json().get("content") if r_get.status_code == 200 else ""
    matched = (saved_text == utf8_text)
    doc.add_step(1, "Guardar texto UTF-8 con caracteres especiales", "Texto íntegro guardado", f"saved={saved_text}", "✓" if matched else "✗")

    doc.attach_evidence("utf8_integrity", {"original": utf8_text, "saved": saved_text, "matched": matched})
    success = status_ok and matched
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
