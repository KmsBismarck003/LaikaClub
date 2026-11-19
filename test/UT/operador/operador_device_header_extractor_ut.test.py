import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from utils.case_documenter import TestCaseDocumenter

def identify_scanning_device(user_agent):
    ua = (user_agent or "").lower()
    if "zebra" in ua or "honeywell" in ua or "symbol" in ua:
        return "HARDWARE_SCANNER"
    elif "mobi" in ua or "android" in ua or "iphone" in ua:
        return "MOBILE_TERMINAL"
    return "DESKTOP_STATION"

def run_test():
    doc = TestCaseDocumenter("CP-OPE-004", "operador_device_header_extractor_ut", "UT / Operador",
                             level="UT", test_type="Lógica / Dispositivos", technique="Caja blanca")
    doc.set_metadata("Validar clasificación del dispositivo de escaneo según cabecera User-Agent",
                     "Garantizar identificación de escáner industrial vs terminal móvil vs estación",
                     "User-Agent de hardware", "Zebra TC26 Android vs Chrome Desktop")
    doc.start()
    d1 = identify_scanning_device("Mozilla/5.0 (Linux; Android 10; Zebra TC26)")
    ok1 = d1 == "HARDWARE_SCANNER"
    doc.add_step(1, "Identificar terminal Zebra", "HARDWARE_SCANNER", d1, "✓" if ok1 else "✗")

    d2 = identify_scanning_device("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0")
    ok2 = d2 == "DESKTOP_STATION"
    doc.add_step(2, "Identificar terminal de escritorio", "DESKTOP_STATION", d2, "✓" if ok2 else "✗")

    doc.attach_evidence("device_ident", {"d1": d1, "d2": d2})
    doc.finish("Aprobada" if (ok1 and ok2) else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
