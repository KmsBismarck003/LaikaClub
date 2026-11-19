## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-007 | Fecha de ejecución | 2026-11-16 12:56:57 |
| Nombre de la prueba | password_encoder_util | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Criptografía / Autenticación Backend | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UT |
| Tipo de prueba | Seguridad |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa unitariamente la generación de hashes BCrypt y la verificación contra contraseñas planas. |
| Objetivo | Garantizar que una contraseña válida verifique y contraseñas incorrectas sean rechazadas. |
| Precondiciones | Módulo bcrypt disponible. |
| Datos de prueba | Contraseña: 'TestPassword2026!', Intento erróneo: 'WrongPassword' |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Generar hash BCrypt con salt de 10 rondas | Hash BCrypt válido generado | Prefijo: $2b$10$... | ✓ |
| 2 | Verificar contraseña correcta contra el hash | Resultado True | Resultado True | ✓ |
| 3 | Verificar contraseña errónea contra el hash | Resultado False | Resultado False | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-007_password_encoder_util_evidence.json](evidencias/CP-007_password_encoder_util_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Cumple con el estándar de cifrado irreversible para credenciales. |
