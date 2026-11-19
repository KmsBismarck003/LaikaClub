import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from utils.case_documenter import TestCaseDocumenter

def filter_public_ads(ads_list):
    valid = []
    for a in ads_list:
        if not a.get("active", False):
            continue
        if a.get("event") is not None:
            evt = a["event"]
            if evt.get("status") != "published" or not evt.get("ads_enabled", False):
                continue
        valid.append(a)
    return valid

def run_test():
    doc = TestCaseDocumenter("CP-ADM-003", "admin_ad_status_filter_ut", "UT / Admin",
                             level="UT", test_type="Lógica / Filtrado", technique="Caja blanca")
    doc.set_metadata("Validar filtrado de anuncios públicos visibles",
                     "Comprobar descarte de anuncios inactivos o eventos deshabilitados",
                     "Lista de anuncios con varios estados", "active, event.status, ads_enabled")
    doc.start()
    sample = [
        {"id": 1, "title": "A1", "active": True, "event": None},
        {"id": 2, "title": "A2", "active": False, "event": None},
        {"id": 3, "title": "A3", "active": True, "event": {"status": "published", "ads_enabled": True}},
        {"id": 4, "title": "A4", "active": True, "event": {"status": "draft", "ads_enabled": True}},
    ]
    res = filter_public_ads(sample)
    ids = [x["id"] for x in res]
    success = (ids == [1, 3])
    doc.add_step(1, "Filtrar anuncios", "IDs [1, 3]", f"IDs {ids}", "✓" if success else "✗")
    doc.attach_evidence("filter_result", {"input_count": len(sample), "output_ids": ids})
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
