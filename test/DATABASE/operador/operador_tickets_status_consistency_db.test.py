import sys
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))
import pymysql
from config.test_config import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-OPE-059", "operador_tickets_status_consistency_db", "DATABASE / Operador",
                             level="DATABASE", test_type="Base de Datos / Consistencia", technique="Caja blanca")
    doc.set_metadata("Validar en laika_tickets.tickets que TKT-C853F390 mantenga estatus active y consistencia.",
                     "Garantizar que el boleto de prueba para control de acceso mantenga integridad relacional",
                     "Base de datos laika_tickets disponible", "Ticket: TKT-C853F390")
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
            cursor.execute("SELECT id, ticket_code, status, event_id, user_id FROM tickets WHERE ticket_code = %s", ("TKT-C853F390",))
            row = cursor.fetchone()
            assert row is not None, "Ticket TKT-C853F390 no existe en base de datos"
            assert row["status"] == "active", f"Estatus inesperado del ticket: {row['status']}"
            assert row["event_id"] == 100001, f"Evento no coincide: {row['event_id']}"
            
        conn.close()
        
        doc.add_step(1, "Verificar registro de ticket en MySQL", "Estatus active en base de datos", f"ID={row['id']}, status={row['status']}", "✓")
        doc.attach_evidence("db_ticket_status", row)
        doc.finish("Aprobada", observations=f"Ticket ID={row['id']}, status={row['status']}, eventId={row['event_id']}")
    except Exception as e:
        doc.finish("Fallida", observations=str(e))
    return doc.result

if __name__ == "__main__":
    run_test()
