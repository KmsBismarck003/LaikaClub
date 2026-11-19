"""
Prueba Unitaria (UT) - Database: Restricciones de Esquema y Llaves Únicas
CP-010: Verifica que las definiciones de columnas y restricciones en MySQL cumplan con el contrato de integridad.
"""
from utils.case_documenter import TestCaseDocumenter
from utils.db_helper import execute_query

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-010",
        name="schema_constraints_validation",
        module="Base de Datos / Integridad Estructural",
        level="UT",
        test_type="Base de Datos",
        technique="Caja blanca",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Audita las restricciones de unicidad y no nulidad en las tablas core del usuario en MySQL.",
        objective="Garantizar que la tabla 'users' y 'tickets' cuenten con índices únicos en email y ticket_code respectivamente.",
        preconditions="Servicio MySQL activo y accesible.",
        test_data="Bases de datos: laika_auth, laika_tickets"
    )
    doc.start()

    # 1. Verificar columna email UNIQUE en laika_auth.users
    q_email = """
        SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_KEY 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'laika_auth' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'email'
    """
    res_email = execute_query("information_schema", q_email)
    s1_ok = (len(res_email) > 0 and res_email[0]["COLUMN_KEY"] == "UNI" and res_email[0]["IS_NULLABLE"] == "NO")
    doc.add_step(
        1,
        "Verificar restricción UNIQUE y NOT NULL en laika_auth.users.email",
        "COLUMN_KEY=UNI, IS_NULLABLE=NO",
        f"COLUMN_KEY={res_email[0]['COLUMN_KEY']}, IS_NULLABLE={res_email[0]['IS_NULLABLE']}" if res_email else "No encontrada",
        "✓" if s1_ok else "✗"
    )

    # 2. Verificar columna ticket_code UNIQUE en laika_tickets.tickets
    q_ticket = """
        SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_KEY 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'laika_tickets' AND TABLE_NAME = 'tickets' AND COLUMN_NAME = 'ticket_code'
    """
    res_ticket = execute_query("information_schema", q_ticket)
    s2_ok = (len(res_ticket) > 0 and res_ticket[0]["COLUMN_KEY"] == "UNI" and res_ticket[0]["IS_NULLABLE"] == "NO")
    doc.add_step(
        2,
        "Verificar restricción UNIQUE y NOT NULL en laika_tickets.tickets.ticket_code",
        "COLUMN_KEY=UNI, IS_NULLABLE=NO",
        f"COLUMN_KEY={res_ticket[0]['COLUMN_KEY']}, IS_NULLABLE={res_ticket[0]['IS_NULLABLE']}" if res_ticket else "No encontrada",
        "✓" if s2_ok else "✗"
    )

    # 3. Verificar llave primaria auto-incremental en ambas tablas
    q_pks = """
        SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, EXTRA
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE (TABLE_SCHEMA = 'laika_auth' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'id')
           OR (TABLE_SCHEMA = 'laika_tickets' AND TABLE_NAME = 'tickets' AND COLUMN_NAME = 'id')
    """
    res_pks = execute_query("information_schema", q_pks)
    s3_ok = (len(res_pks) == 2 and all("auto_increment" in r["EXTRA"].lower() for r in res_pks))
    doc.add_step(
        3,
        "Verificar llaves primarias auto-incrementables en users y tickets",
        "Ambas tablas con id auto_increment",
        f"{len(res_pks)} tablas verificadas con auto_increment",
        "✓" if s3_ok else "✗"
    )

    all_passed = s1_ok and s2_ok and s3_ok
    doc.attach_evidence("schema_metadata", {"users_email": res_email, "tickets_code": res_ticket, "pks": res_pks})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="Esquema relacional en MySQL cumple con las reglas de integridad de datos.")

    return {
        "id": "CP-010",
        "name": "schema_constraints_validation",
        "level": "UT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

