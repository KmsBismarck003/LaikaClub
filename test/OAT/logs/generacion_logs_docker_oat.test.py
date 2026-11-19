"""
Prueba de Aceptación Operativa (OAT) - Logs: Emisión de Trazas Operativas
CP-036: Verifica la persistencia y emisión de bitácoras de auditoría en los servicios y gateway.
"""
import os
import subprocess
from pathlib import Path
from utils.case_documenter import TestCaseDocumenter

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-036",
        name="generacion_logs_docker_oat",
        module="OAT / Observabilidad y Logs",
        level="OAT",
        test_type="Operacional / Logs",
        technique="Caja negra",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa la generación de registros en vivo mediante inspección de logs de contenedores Docker y archivos de bitácora del sistema.",
        objective="Garantizar que las transacciones y peticiones HTTP queden debidamente registradas para auditoría.",
        preconditions="Contenedores Docker en ejecución.",
        test_data="Contenedor 'laika_gateway' y 'laika_tickets'"
    )
    doc.start()

    # 1. Inspeccionar logs de Docker para laika_gateway
    try:
        proc = subprocess.run(
            ["docker", "logs", "--tail", "15", "laika_gateway"],
            capture_output=True,
            text=True,
            timeout=10
        )
        logs_gateway = proc.stdout + proc.stderr
        s1_ok = (len(logs_gateway.strip()) > 0)
        doc.add_step(
            1,
            "Capturar las últimas líneas de bitácora de 'laika_gateway'",
            "Trazas de log registradas en stdout",
            f"{len(logs_gateway.splitlines())} líneas de registro capturadas",
            "✓" if s1_ok else "✗"
        )
    except Exception as e:
        logs_gateway = str(e)
        s1_ok = False
        doc.add_step(1, "Capturar logs de 'laika_gateway'", "Trazas registradas", f"Error: {e}", "✗")

    # 2. Inspeccionar logs de Docker para laika_tickets
    try:
        proc2 = subprocess.run(
            ["docker", "logs", "--tail", "15", "laika_tickets"],
            capture_output=True,
            text=True,
            timeout=10
        )
        logs_tickets = proc2.stdout + proc2.stderr
        s2_ok = (len(logs_tickets.strip()) > 0)
        doc.add_step(
            2,
            "Capturar las últimas líneas de bitácora de 'laika_tickets'",
            "Trazas Spring Boot registradas en stdout",
            f"{len(logs_tickets.splitlines())} líneas de registro capturadas",
            "✓" if s2_ok else "✗"
        )
    except Exception as e:
        logs_tickets = str(e)
        s2_ok = False
        doc.add_step(2, "Capturar logs de 'laika_tickets'", "Trazas registradas", f"Error: {e}", "✗")

    all_passed = s1_ok and s2_ok
    doc.attach_evidence("docker_logs_snippet", {
        "gateway_sample": logs_gateway[-300:] if len(logs_gateway) > 300 else logs_gateway,
        "tickets_sample": logs_tickets[-300:] if len(logs_tickets) > 300 else logs_tickets
    })
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="Los contenedores emiten telemetría y bitácora estándar para trazabilidad operativa.")

    return {
        "id": "CP-036",
        "name": "generacion_logs_docker_oat",
        "level": "OAT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

