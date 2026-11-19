## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-062 | Fecha de ejecución | 2026-11-16 12:56:30 |
| Nombre de la prueba | register_correo_duplicado_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Registro de Usuario | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Validación / Negativo |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa el manejo de colisión de unicidad al enviar una solicitud de registro con un correo que ya existe en la base de datos. |
| Objetivo | Garantizar que el sistema rechace el registro duplicado retornando código HTTP 400 o 409 sin error 500. |
| Precondiciones | Usuario con QA_USER_EMAIL ya registrado. |
| Datos de prueba | Email duplicado: qa_user_test@laikaclub.com |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Intentar registrar usuario con email existente 'qa_user_test@laikaclub.com' | HTTP 400 Bad Request o 409 Conflict | HTTP 500 | ✗ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Fallida |
| Evidencias | [CP-062_register_correo_duplicado_post_evidence.json](evidencias/CP-062_register_correo_duplicado_post_evidence.json) |
| Defecto reportado | DEF-001 |
| Severidad del defecto | Alta |
| Observaciones | El microservicio de autenticación laika_auth retorna HTTP 500 (Internal Server Error) en lugar de HTTP 409 (Conflict) o HTTP 400 (Bad Request) cuando un usuario intenta registrarse con un correo ya existente. Esto genera falsas alarmas de fallo interno en sistemas de monitoreo y degrada la experiencia del cliente. |
