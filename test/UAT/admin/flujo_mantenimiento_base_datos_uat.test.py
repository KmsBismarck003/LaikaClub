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
    doc = TestCaseDocumenter("CP-ADM-024", "flujo_mantenimiento_base_datos_uat", "UAT / Admin",
                             level="UAT", test_type="Aceptación de Usuario", technique="Caja negra")
    doc.set_metadata("Flujo de aceptación de mantenimiento y salud de base de datos",
                     "Consultar tablas, estadísticas de almacenamiento y ejecutar limpieza de caché",
                     "Admin autenticado", "/api/database/*")
    doc.start()
    headers = get_admin_auth_headers()

    # 1. Consultar tablas
    r_tables = requests.get(f"{GATEWAY_URL}/api/database/tables", headers=headers, timeout=10)
    tables_ok = r_tables.status_code == 200
    doc.add_step(1, "Inspeccionar catálogo de tablas", "HTTP 200", f"HTTP {r_tables.status_code}", "✓" if tables_ok else "✗")

    # 2. Consultar stats
    r_stats = requests.get(f"{GATEWAY_URL}/api/database/stats", headers=headers, timeout=10)
    stats_ok = r_stats.status_code == 200
    doc.add_step(2, "Inspeccionar estadísticas de almacenamiento", "HTTP 200", f"HTTP {r_stats.status_code}", "✓" if stats_ok else "✗")

    # 3. Limpiar caché
    r_cache = requests.post(f"{GATEWAY_URL}/api/database/clear-cache", headers=headers, timeout=10)
    cache_ok = r_cache.status_code == 200
    doc.add_step(3, "Ejecutar limpieza de caché en microservicio admin", "HTTP 200", f"HTTP {r_cache.status_code}", "✓" if cache_ok else "✗")

    doc.attach_evidence("db_maintenance_flow", {"tables_ok": tables_ok, "stats_ok": stats_ok, "cache_ok": cache_ok})
    success = tables_ok and stats_ok and cache_ok
    doc.finish("Aprobada" if success else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
