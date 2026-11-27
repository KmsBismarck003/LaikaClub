import sys
import pymysql
from pathlib import Path
TEST_ROOT = Path(__file__).resolve().parent.parent.parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter("CP-OPE-007", "operador_ticket_service_mysql_it", "IT / Operador",
                             level="IT", test_type="Integración / Base de datos", technique="Caja gris")
    doc.set_metadata("Comprobar integración TicketService <-> laika_tickets.tickets",
                     "Validar consulta de boletos existentes con ticket_code y status",
                     "Base de datos laika_tickets", "SELECT ticket_code, status FROM tickets LIMIT 5")
    doc.start()
    conn = pymysql.connect(host=MYSQL_HOST, port=MYSQL_PORT, user=MYSQL_USER, password=MYSQL_PASSWORD, database="laika_tickets")
    cur = conn.cursor()
    cur.execute("SELECT id, ticket_code, status, price, event_id FROM tickets WHERE ticket_code = 'TKT-C853F390'")
    row = cur.fetchone()
    has_ticket = row is not None
    doc.add_step(1, "Consultar boleto activo en MySQL", "Boleto TKT-C853F390 encontrado", f"Encontrado: {row[:3] if row else 'Ninguno'}", "✓" if has_ticket else "✗")
    conn.close()

    doc.attach_evidence("db_ticket", {"ticket": row})
    doc.finish("Aprobada" if has_ticket else "Fallida")
    return doc.result

if __name__ == "__main__":
    run_test()
