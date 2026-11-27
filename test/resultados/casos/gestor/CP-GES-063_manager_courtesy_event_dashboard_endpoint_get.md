## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-063 | Fecha de ejecución | 2026-11-16 16:14:03 |
| Nombre de la prueba | manager_courtesy_event_dashboard_endpoint_get | Responsable (tester) | QA Automation |
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
| Descripción | Comprobar endpoint GET /api/tickets/courtesy/event/{eventId} |
| Objetivo | Validar entrega de dashboard de cortesías de un evento específico |
| Precondiciones | Evento ID 100001 |
| Datos de prueba | GET /api/tickets/courtesy/event/100001 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/tickets/courtesy/event/100001 | HTTP 200 con totalQuotaAllowed | HTTP 200, allowed=25 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-063_manager_courtesy_event_dashboard_endpoint_get_evidence.json](evidencias/gestor/CP-GES-063_manager_courtesy_event_dashboard_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
