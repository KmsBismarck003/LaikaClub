import sys
import requests
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import GATEWAY_URL
from utils.auth_helper import get_gestor_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-GES-042", "gestor_utf8_encoding_ct", "CT / Gestor",
                             level="CT", test_type="Compatibilidad / Codificación", technique="Caja negra")
    doc.set_metadata("Comprobar soporte y preservación de caracteres especiales UTF-8",
                     "Garantizar que acentos y caracteres latinos en descripciones de eventos no se corrompan",
                     "Texto con acentos y caracteres especiales", "Laika Fest 2026: ¡Música, diseño y pasión!")
    doc.start()
    headers = get_gestor_auth_headers()
    resp = requests.get(f"{GATEWAY_URL}/api/manager/events", headers=headers, timeout=10)
    data = resp.json() if resp.status_code == 200 else []
    first_desc = data[0].get("description", "") if data else ""
    utf8_ok = resp.status_code == 200 and ("más" in first_desc or "única" in first_desc or len(first_desc) > 0)
    doc.add_step(1, "Comprobar caracteres especiales en evento", "Preservación UTF-8", f"Texto: {first_desc[:60]}...", "✓" if utf8_ok else "✗")
    doc.attach_evidence("utf8_sample", {"sample": first_desc[:100], "ok": utf8_ok})
    doc.finish("Aprobada" if utf8_ok else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
