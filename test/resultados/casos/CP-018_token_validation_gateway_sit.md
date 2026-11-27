## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-018 | Fecha de ejecución | 2026-11-16 12:56:47 |
| Nombre de la prueba | token_validation_gateway_sit | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | SIT / Verificación de Sesión | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SIT |
| Tipo de prueba | Integración de Sistema |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa la capacidad del Gateway para transferir tokens Bearer en cabeceras HTTP hacia /api/auth/verify. |
| Objetivo | Verificar que una sesión activa sea confirmada con status HTTP 200 y valid=true. |
| Precondiciones | Token JWT obtenido en tiempo de ejecución de un usuario real. |
| Datos de prueba | Token JWT Bearer |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar GET /api/auth/verify con token válido | HTTP 200 OK | HTTP 200 | ✓ |
| 2 | Verificar flag de validez en payload de respuesta | valid: True | valid: True | ✓ |
| 3 | Verificar objeto de usuario adjunto a la sesión | Objeto user con email presente | Email: qa_user_test@laikaclub.com | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-018_token_validation_gateway_sit_evidence.json](evidencias/CP-018_token_validation_gateway_sit_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El middleware de autenticación valida correctamente la firma criptográfica. |
