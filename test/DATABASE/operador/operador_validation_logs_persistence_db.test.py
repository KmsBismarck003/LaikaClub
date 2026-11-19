import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import pymysql
from config.test_config import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-OPE-058", "operador_validation_logs_persistence_db", "DATABASE / Operador",
                             level="DATABASE", test_type="Base de Datos / Persistencia", technique="Caja blanca")
    doc.set_metadata("Validar en MySQL la existencia y persistencia de columnas en ticket_validation_logs.",
                     "Comprobar integridad de esquema relacional y registro permanente de auditoría óptica",
                     "Contenedor laika_db activo en puerto 3306", "Tabla: ticket_validation_logs")
    doc.start()
    try:
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database="laika_tickets",
            cursorclass=pymysql.cursors.DictCursor
        )
        with conn.cursor() as cursor:
            cursor.execute("DESCRIBE ticket_validation_logs")
            columns = [row["Field"] for row in cursor.fetchall()]
            
            required_cols = ["id", "ticket_code", "action_type", "result_status", "device_info", "validation_date"]
            for col in required_cols:
                assert col in columns, f"Falta columna {col} en ticket_validation_logs"
                
            cursor.execute("SELECT COUNT(*) AS total FROM ticket_validation_logs")
            count = cursor.fetchone()["total"]
            assert count > 0, "No se encontraron logs de validación persistidos"
            
        conn.close()
        
        doc.add_step(1, "Verificar esquema y persistencia en MySQL", "Esquema íntegro y registros > 0", f"Columnas OK, Total logs={count}", "✓")
        doc.attach_evidence("db_validation_logs", {"total_logs": count, "columns": columns})
        doc.finish("Aprobada", observations=f"Esquema verificado. Total logs persistidos: {count}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
