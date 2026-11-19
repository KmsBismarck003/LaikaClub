## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-054 | Fecha de ejecución | 2026-11-16 16:14:04 |
| Nombre de la prueba | manager_event_functions_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Funciones |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint GET /api/events/{id}/functions |
| Objetivo | Validar obtención de fechas y horarios programados del evento |
| Precondiciones | Evento ID 100001 |
| Datos de prueba | GET /api/events/100001/functions |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/events/100001/functions | HTTP 200 con array JSON | HTTP 404 | ✗ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Fallida |
| Evidencias | [CP-GES-054_manager_event_functions_endpoint_get_evidence.json](evidencias/gestor/CP-GES-054_manager_event_functions_endpoint_get_evidence.json) |
| Defecto reportado | DEF-GES-002 |
| Severidad del defecto | Media |
| Observaciones | Endpoint /api/events/{id}/functions responde HTTP 404 a pesar de estar mapeado en el backend |
