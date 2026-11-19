import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from utils.case_documenter import TestCaseDocumenter

def parse_qr_ticket_code(raw_input):
    if not raw_input or not isinstance(raw_input, str):
        return None
    cleaned = raw_input.strip()
    if cleaned.startswith("http"):
        parts = cleaned.rstrip("/").split("/")
        cleaned = parts[-1]
    if cleaned.upper().startswith("TKT-"):
        return cleaned.upper()
    return f"TKT-{cleaned.upper()}"

def run_test():
    doc = TestCaseDocumenter("CP-OPE-001", "operador_qr_parser_ut", "UT / Operador",
                             level="UT", test_type="Lógica / QR", technique="Caja blanca")
    doc.set_metadata("Validar normalización y extracción de código de boleto desde lectura QR",
                     "Garantizar formato unificado TKT-XXXXX desde strings crudos o URLs",
                     "Entradas de scanner óptico", "https://laikaclub.com/t/TKT-C853F390")
    doc.start()
    res1 = parse_qr_ticket_code("https://laikaclub.com/t/TKT-C853F390")
    ok1 = res1 == "TKT-C853F390"
    doc.add_step(1, "Parsear URL de boleto", "TKT-C853F390", res1, "✓" if ok1 else "✗")

    res2 = parse_qr_ticket_code("  c853f390  ")
    ok2 = res2 == "TKT-C853F390"
    doc.add_step(2, "Normalizar código alfanumérico sin prefijo", "TKT-C853F390", res2, "✓" if ok2 else "✗")

    doc.attach_evidence("parser_results", {"test1": res1, "test2": res2})
    doc.finish("Aprobada" if (ok1 and ok2) else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
