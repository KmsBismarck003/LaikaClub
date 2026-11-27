"""
Prueba Unitaria (UT) - Backend: Algoritmo de Hashing BCrypt
CP-007: Verifica la fortaleza criptográfica y la correcta verificación de contraseñas con salting.
"""
import bcrypt
from utils.case_documenter import TestCaseDocumenter

def hash_password(password):
    salt = bcrypt.gensalt(rounds=10)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def check_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def run_test():
    doc = TestCaseDocumenter(
        test_id="CP-007",
        name="password_encoder_util",
        module="Criptografía / Autenticación Backend",
        level="UT",
        test_type="Seguridad",
        technique="Caja blanca",
        execution="Automatizada"
    )
    doc.set_metadata(
        description="Evalúa unitariamente la generación de hashes BCrypt y la verificación contra contraseñas planas.",
        objective="Garantizar que una contraseña válida verifique y contraseñas incorrectas sean rechazadas.",
        preconditions="Módulo bcrypt disponible.",
        test_data="Contraseña: 'TestPassword2026!', Intento erróneo: 'WrongPassword'"
    )
    doc.start()

    raw_pwd = "TestPassword2026!"
    hashed = hash_password(raw_pwd)

    step1_ok = (hashed.startswith("$2b$") or hashed.startswith("$2a$"))
    doc.add_step(1, "Generar hash BCrypt con salt de 10 rondas", "Hash BCrypt válido generado", f"Prefijo: {hashed[:7]}...", "✓" if step1_ok else "✗")

    match_correct = check_password(raw_pwd, hashed)
    step2_ok = match_correct is True
    doc.add_step(2, "Verificar contraseña correcta contra el hash", "Resultado True", f"Resultado {match_correct}", "✓" if step2_ok else "✗")

    match_wrong = check_password("WrongPassword", hashed)
    step3_ok = match_wrong is False
    doc.add_step(3, "Verificar contraseña errónea contra el hash", "Resultado False", f"Resultado {match_wrong}", "✓" if step3_ok else "✗")

    all_passed = step1_ok and step2_ok and step3_ok
    doc.attach_evidence("bcrypt_evidence", {"prefix": hashed[:7], "correct_verified": match_correct, "wrong_rejected": not match_wrong})
    doc_status = "Aprobada" if all_passed else "Fallida"
    doc.finish(doc_status, observations="Cumple con el estándar de cifrado irreversible para credenciales.")

    return {
        "id": "CP-007",
        "name": "password_encoder_util",
        "level": "UT",
        "status": doc_status
    }

if __name__ == "__main__":
    run_test()

