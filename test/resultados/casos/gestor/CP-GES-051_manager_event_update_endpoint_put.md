## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-051 | Fecha de ejecución | 2026-11-16 16:14:04 |
| Nombre de la prueba | manager_event_update_endpoint_put | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Eventos |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint PUT /api/events/{id} |
| Objetivo | Validar actualización de metadatos de un evento |
| Precondiciones | Evento ID 100001 |
| Datos de prueba | PUT /api/events/100001 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | PUT /api/events/100001 | HTTP 200 | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-051_manager_event_update_endpoint_put_evidence.json](evidencias/gestor/CP-GES-051_manager_event_update_endpoint_put_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
