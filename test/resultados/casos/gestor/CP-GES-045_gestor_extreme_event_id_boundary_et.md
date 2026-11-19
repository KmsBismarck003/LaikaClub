## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-045 | Fecha de ejecución | 2026-11-16 16:14:26 |
| Nombre de la prueba | gestor_extreme_event_id_boundary_et | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | ET / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | ET |
| Tipo de prueba | Exploratorio / Límites |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Explorar comportamiento ante ID de evento no existente (99999999) |
| Objetivo | Garantizar que el sistema no colapse ante identificadores fuera de rango |
| Precondiciones | ID = 99999999 |
| Datos de prueba | GET /api/manager/events/99999999/tickets |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar boletos de ID 99999999 | Manejo controlado (HTTP 200 vacío o 404) | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-045_gestor_extreme_event_id_boundary_et_evidence.json](evidencias/gestor/CP-GES-045_gestor_extreme_event_id_boundary_et_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
