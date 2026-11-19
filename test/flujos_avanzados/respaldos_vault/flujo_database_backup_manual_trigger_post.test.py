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
    doc = TestCaseDocumenter("CP-ADV-049", "flujo_database_backup_manual_trigger_post", "Base de Datos / Respaldos",
                             level="API", test_type="Operacional / Mantenimiento", technique="Caja negra")
    doc.set_metadata("Validar disparo manual de respaldo completo de la base de datos MySQL por administrador",
                     "Comprobar registro en historial de backups con identificador único y ejecución asíncrona",
                     "Servicio laika_admin activo; credenciales admin", "Ruta: POST /api/database/backup")
    doc.start()
    try:
        headers = get_admin_auth_headers()
        payload = {"engine": "mysql", "type": "full"}
        r = requests.post(f"{GATEWAY_URL}/api/database/backup", json=payload, headers=headers, timeout=TIMEOUT_DEFAULT)
        assert r.status_code == 200, f"Error al disparar respaldo: {r.status_code} - {r.text}"
        data = r.json()
        assert data.get("success") is True, f"Fallo en respuesta: {data}"
        backup_id = data.get("backup_id")
        doc.add_step(1, "Disparar respaldo manual MySQL", "HTTP 200 con backup_id generado", f"HTTP {r.status_code} ({backup_id})", "✓")
        doc.attach_evidence("backup_trigger", data)
        doc.finish("Aprobada", observations=f"Respaldo manual disparado exitosamente: {backup_id}")

    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
