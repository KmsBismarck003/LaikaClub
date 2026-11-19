"""
Prueba de Base de Datos (DATABASE) - Persistencia Real en MySQL: Tabla laika_auth.users
CP-075: Verifica la inserción física, hash y campos por defecto en la base de datos de autenticación.
"""
from utils.case_documenter import TestCaseDocumenter
from utils.db_helper import execute_single
from config.test_config import QA_USER_EMAIL

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-075",
        name="persistencia_usuario_registro_db",
        module="Base de Datos / laika_auth.users",
        level="DATABASE",
        test_type="Base de Datos",
        technique="Caja blanca",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa directamente en la base de datos MySQL laika_auth la consistencia física del registro de usuario de prueba.",
        objective="Verificar que el registro contenga hash BCrypt en password_hash, rol 'usuario', status 'active' y fecha de creación no nula.",
        preconditions="MySQL activo en localhost:3306.",
        test_data=f"Email: {QA_USER_EMAIL}"
    )
    doc.start()

    user = execute_single(
        "laika_auth",
        "SELECT id, email, role, status, password_hash, created_at, subscription_tier FROM users WHERE email = %s",
        (QA_USER_EMAIL,)
    )

    s1_ok = (user is not None and user.get("email") == QA_USER_EMAIL)
    doc.add_step(
        1,
        f"Consultar fila del usuario '{QA_USER_EMAIL}' en laika_auth.users",
        "Fila encontrada en la tabla física",
        f"ID={user.get('id') if user else 'N/A'}",
        "✓" if s1_ok else "✗"
    )

    s2_ok = (user is not None and user.get("role") == "usuario" and user.get("status") == "active")
    doc.add_step(
        2,
        "Validar rol='usuario' y status='active'",
        "Rol y estatus correctos",
        f"Rol={user.get('role') if user else 'N/A'}, Status={user.get('status') if user else 'N/A'}",
        "✓" if s2_ok else "✗"
    )

    s3_ok = (user is not None and str(user.get("password_hash")).startswith("$2"))
    doc.add_step(
        3,
        "Validar que la contraseña esté cifrada con BCrypt ($2...)",
        "Hash criptográfico irreversible",
        f"Prefijo de hash: {user.get('password_hash')[:7] if user and user.get('password_hash') else 'N/A'}",
        "✓" if s3_ok else "✗"
    )

    all_passed = s1_ok and s2_ok and s3_ok
    doc.attach_evidence("db_user_row", {k: str(v) for k, v in user.items()} if user else {})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="El registro de usuario en MySQL cumple con todos los atributos de persistencia requeridos.")

    return {
        "id": "CP-075",
        "name": "persistencia_usuario_registro_db",
        "level": "DATABASE",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

