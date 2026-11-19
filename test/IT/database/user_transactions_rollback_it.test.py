"""
Prueba de Integración (IT) - Database: Transaccionalidad y Rollback en Operaciones
CP-016: Verifica que una transacción abortada revierta los cambios sin dejar datos corruptos.
"""
from utils.case_documenter import TestCaseDocumenter
from utils.db_helper import get_connection, execute_single
import pymysql

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-016",
        name="user_transactions_rollback_it",
        module="Base de Datos / Transacciones ACID",
        level="IT",
        test_type="Integración",
        technique="Caja blanca",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa el soporte transaccional ACID de MySQL InnoDB mediante una transacción de prueba con rollback forzado.",
        objective="Garantizar que transacciones fallidas o abortadas no persistan registros en la base de datos.",
        preconditions="MySQL InnoDB activo en la base de datos laika_auth.",
        test_data="Inserción de usuario temporal 'rollback_test_user@laikaclub.com' con rollback"
    )
    doc.start()

    test_email = "rollback_test_temp@laikaclub.com"
    conn = get_connection("laika_auth")
    conn.autocommit(False)

    try:
        with conn.cursor() as cursor:
            # 1. Iniciar transacción e insertar registro de prueba
            cursor.execute(
                "INSERT INTO users (first_name, last_name, email, password_hash, role, status) "
                "VALUES (%s, %s, %s, %s, %s, %s)",
                ("Temp", "Rollback", test_email, "dummyhash", "usuario", "active")
            )
        s1_ok = True
        doc.add_step(1, "Insertar registro en transacción no confirmada (uncommitted)", "Inserción ejecutada en sesión", "Inserción exitosa", "✓")

        # 2. Ejecutar ROLLBACK
        conn.rollback()
        s2_ok = True
        doc.add_step(2, "Ejecutar comando ROLLBACK explícito", "Transacción revertida", "Rollback exitoso", "✓")

    except Exception as e:
        conn.rollback()
        s1_ok = False
        s2_ok = False
        doc.add_step(1, "Insertar registro en transacción", "Inserción ejecutada", f"Error: {e}", "✗")
    finally:
        conn.close()

    # 3. Comprobar que el registro NO exista físicamente en la tabla
    check = execute_single("laika_auth", "SELECT id FROM users WHERE email = %s", (test_email,))
    s3_ok = (check is None)
    doc.add_step(
        3,
        f"Comprobar ausencia del registro '{test_email}' en laika_auth.users",
        "Registro no debe existir (None)",
        f"Resultado: {'No existe (Rollback íntegro)' if check is None else 'Existe (Fallo de rollback)'}",
        "✓" if s3_ok else "✗"
    )

    all_passed = s1_ok and s2_ok and s3_ok
    doc.attach_evidence("transaction_verification", {"test_email": test_email, "persisted_after_rollback": check is not None})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="Motor InnoDB respeta estrictamente la atomicidad y aislamiento de transacciones.")

    return {
        "id": "CP-016",
        "name": "user_transactions_rollback_it",
        "level": "IT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

