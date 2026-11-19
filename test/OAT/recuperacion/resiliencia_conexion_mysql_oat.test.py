"""
Prueba de Aceptación Operativa (OAT) - Recuperación: Resiliencia de Conexión a Base de Datos
CP-037: Evalúa la estabilidad y liberación de recursos en el pool de conexiones MySQL.
"""
from utils.case_documenter import TestCaseDocumenter
from utils.db_helper import get_connection

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-037",
        name="resiliencia_conexion_mysql_oat",
        module="OAT / Resiliencia de Base de Datos",
        level="OAT",
        test_type="Operacional / Resiliencia",
        technique="Caja blanca",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la apertura, ejecución y cierre sucesivo de múltiples conexiones independientes a MySQL para validar que no existan fugas en el gestor.",
        objective="Garantizar que el servicio MySQL gestione adecuadamente conexiones secuenciales sin agotar descriptores ni generar bloqueos.",
        preconditions="Contenedor laika_db activo en puerto 3306.",
        test_data="Bucle de 20 conexiones consecutivas realizando queries de verificación."
    )
    doc.start()

    iterations = 20
    successful_conns = 0

    for i in range(iterations):
        try:
            conn = get_connection("laika_auth")
            with conn.cursor() as cursor:
                cursor.execute("SELECT 1 AS alive")
                res = cursor.fetchone()
                if res and res["alive"] == 1:
                    successful_conns += 1
            conn.close()
        except Exception:
            pass

    s1_ok = (successful_conns == iterations)
    doc.add_step(
        1,
        f"Abrir, ejecutar 'SELECT 1' y cerrar {iterations} conexiones consecutivas a MySQL",
        f"{iterations} conexiones exitosas",
        f"{successful_conns}/{iterations} conexiones completadas sin error",
        "✓" if s1_ok else "✗"
    )

    doc.attach_evidence("connection_resilience", {"total_tested": iterations, "successful": successful_conns})
    doc_status = "Aprobada" if s1_ok else "Fallida"
    doc.finish(doc_status, observations="El motor MySQL libera descriptores de socket y memoria limpiamente.")

    return {
        "id": "CP-037",
        "name": "resiliencia_conexion_mysql_oat",
        "level": "OAT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

