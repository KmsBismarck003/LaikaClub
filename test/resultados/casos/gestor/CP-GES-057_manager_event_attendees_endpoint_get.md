## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-057 | Fecha de ejecución | 2026-11-16 16:14:04 |
| Nombre de la prueba | manager_event_attendees_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Asistentes |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint GET /api/manager/events/{id}/attendees |
| Objetivo | Validar lista de asistentes registrados y estatus de ingreso |
| Precondiciones | Evento ID 100001 |
| Datos de prueba | GET /api/manager/events/100001/attendees |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/manager/events/100001/attendees | HTTP 200 con array JSON | HTTP 200, asistentes=11 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-057_manager_event_attendees_endpoint_get_evidence.json](evidencias/gestor/CP-GES-057_manager_event_attendees_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
