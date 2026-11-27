## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-064 | Fecha de ejecución | 2026-11-16 16:14:04 |
| Nombre de la prueba | manager_courtesy_validate_token_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Cortesías |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint GET /api/tickets/courtesy/validate-token/{token} |
| Objetivo | Validar previsualización de código de cortesía previo a su canje |
| Precondiciones | Token inexistente |
| Datos de prueba | GET /api/tickets/courtesy/validate-token/TEST-CODE-INVALID |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Previsualizar token de cortesía | Manejo HTTP 200 o 404 | HTTP 404 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-064_manager_courtesy_validate_token_endpoint_get_evidence.json](evidencias/gestor/CP-GES-064_manager_courtesy_validate_token_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
