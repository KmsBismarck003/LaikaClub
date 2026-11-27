## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-058 | Fecha de ejecución | 2026-11-16 12:56:28 |
| Nombre de la prueba | login_endpoint_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Autenticación | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa el endpoint de login enviando credenciales válidas en formato JSON. |
| Objetivo | Verificar que el servicio responda con código HTTP 200, cabecera application/json y cuerpo con token JWT y objeto user. |
| Precondiciones | Usuario registrado y activo en el sistema. |
| Datos de prueba | Email: qa_user_test@laikaclub.com, Contraseña válida |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | POST a http://localhost:8000/api/auth/login con credenciales correctas | HTTP 200 OK | HTTP 200 | ✓ |
| 2 | Verificar presencia de token JWT en la respuesta | Token presente y firmado | Longitud: 203 caracteres | ✓ |
| 3 | Verificar objeto user devuelto | Email coincide con qa_user_test@laikaclub.com | Email: qa_user_test@laikaclub.com | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-058_login_endpoint_post_evidence.json](evidencias/CP-058_login_endpoint_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El endpoint de login responde conforme a la especificación OpenAPI. |
