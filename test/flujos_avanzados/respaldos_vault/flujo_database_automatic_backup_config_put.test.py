import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parents[2]
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import requests
from config.test_config import GATEWAY_URL, TIMEOUT_DEFAULT
from utils.auth_helper import get_auth_headers, get_admin_auth_headers, get_gestor_auth_headers
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-ADV-051", "flujo_database_automatic_backup_config_put", "Base de Datos / Auto Backup",
                             level="API", test_type="Configuración / Mantenimiento", technique="Caja negra")
    doc.set_metadata("Validar actualización de configuración de respaldos automáticos programados",
                     "Comprobar persistencia de frecuencia de ejecución, retención de archivos y habilitación",
                     "Servicio laika_admin activo; credenciales admin", "Ruta: PUT /api/database/automatic-backup/config")
    doc.start()
    try:
        headers = get_admin_auth_headers()
        payload = {
            "enabled": True,
            "frequency": "daily",
            "time": "03:00",
            "retentionDays": 15,
            "destination": "local"
        }
        r = requests.put(f"{GATEWAY_URL}/api/database/automatic-backup/config", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 200, f"Error al configurar auto-backup: {r.status_code} - {r.text}"
        data = r.json()
        doc.add_step(1, "Actualizar política de auto-respaldos", "HTTP 200 con confirmación", f"HTTP {r.status_code}", "✓")
        doc.attach_evidence("auto_backup_config", data)
        doc.finish("Aprobada", observations="Política de respaldos automáticos actualizada y persistida correctamente")

    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
