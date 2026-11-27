## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-022 | Fecha de ejecución | 2026-11-16 16:15:01 |
| Nombre de la prueba | gateway_cors_headers_sit | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | SIT / CORS e Interoperabilidad Gateway | Ambiente | QA / Docker Live Services |
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
| Descripción | Evalúa la política de Cross-Origin Resource Sharing (CORS) expuesta por Pilgrim Gateway ante peticiones de navegadores. |
| Objetivo | Verificar que el Gateway responda con encabezados Access-Control-Allow-Origin y permita métodos estándar. |
| Precondiciones | Pilgrim Gateway en ejecución en puerto 8000. |
| Datos de prueba | Origen simulado: http://localhost:3000, Método: OPTIONS y GET |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar GET con cabecera Origin: http://localhost:3000 | Encabezado access-control-allow-origin presente en la respuesta | CORS Origin: http://localhost:3000 | ✓ |
| 2 | Enviar pre-flight OPTIONS a /api/auth/login | HTTP 200 o 204 aceptando preflight | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-022_gateway_cors_headers_sit_evidence.json](evidencias/usuario/CP-022_gateway_cors_headers_sit_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El API Gateway permite la comunicación segura entre la SPA de React y los microservicios. |
