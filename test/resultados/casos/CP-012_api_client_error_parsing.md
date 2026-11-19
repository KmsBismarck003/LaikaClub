## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-012 | Fecha de ejecución | 2026-11-16 12:56:36 |
| Nombre de la prueba | api_client_error_parsing | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Cliente HTTP / Frontend Error Handling | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | IT |
| Tipo de prueba | Integración |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa el procesamiento de respuestas de error estructuradas provenientes de Spring Boot y FastAPI Gateway. |
| Objetivo | Garantizar que los errores con formato {detail: ...} o {message: ...} se traduzcan en mensajes claros. |
| Precondiciones | Lógica de parsing de apiClient.js implementada. |
| Datos de prueba | Payloads: dict con message, dict con detail dict, lista de errores Pydantic |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Parsear error estándar de Spring Boot ({'message': ...}) | Credenciales inválidas | Credenciales inválidas | ✓ |
| 2 | Parsear error anidado de Pilgrim Gateway ({'detail': {'message': ...}}) | Credenciales inválidas | Credenciales inválidas | ✓ |
| 3 | Parsear error de validación de campos ({'detail': [{'loc': ...}]}) | email: field required | email: field required | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-012_api_client_error_parsing_evidence.json](evidencias/CP-012_api_client_error_parsing_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El cliente HTTP desacopla las variaciones entre microservicios Java y Gateway Python. |
