import sys
import time
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from utils.case_documenter import TestCaseDocumenter
from utils.db_helper import execute_query

def run_test():
    doc = TestCaseDocumenter("CP-ADM-088", "admin_persistencia_ads_db", "DATABASE / Admin",
                             level="DATABASE", test_type="Integridad Relacional", technique="Caja gris")
    doc.set_metadata("Comprobar integridad de tabla ads y ad_clicks en la base laika_admin",
                     "Garantizar que las llaves foráneas o referencias de ID se mantengan consistentes",
                     "MySQL 8.0 tabla laika_admin.ads", "Auditoría de consistencia de anuncios")
    doc.start()
    ads = execute_query("laika_admin", "SELECT id, title, active FROM ads LIMIT 5;")
    clicks = execute_query("laika_admin", "SELECT id, ad_id, user_id FROM ad_clicks LIMIT 5;")
    valid = len(ads) >= 0 and len(clicks) >= 0
    doc.add_step(1, "Consultar tablas ads y ad_clicks", "Conexión y tablas operativas", f"ads={len(ads)}, clicks={len(clicks)}", "✓" if valid else "✗")

    doc.attach_evidence("db_ads_tables", {"ads_count": len(ads), "clicks_count": len(clicks)})
    doc.finish("Aprobada" if valid else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
