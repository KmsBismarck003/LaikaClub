## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-053 | Fecha de ejecución | 2026-11-16 16:14:04 |
| Nombre de la prueba | manager_event_unpublish_patch_endpoint | Responsable (tester) | QA Automation |
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
| Descripción | Comprobar endpoint PATCH /api/manager/events/{id}/unpublish |
| Objetivo | Validar retiro de publicación temporal de evento (mover a borrador) |
| Precondiciones | Evento ID 100001 |
| Datos de prueba | PATCH /api/manager/events/100001/unpublish |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Mover evento a borrador | HTTP 200 | HTTP 200 | ✓ |
| 2 | Restaurar publicación | HTTP 200 | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-053_manager_event_unpublish_patch_endpoint_evidence.json](evidencias/gestor/CP-GES-053_manager_event_unpublish_patch_endpoint_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
