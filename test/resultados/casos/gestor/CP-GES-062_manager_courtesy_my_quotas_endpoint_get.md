## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-062 | Fecha de ejecución | 2026-11-16 16:14:04 |
| Nombre de la prueba | manager_courtesy_my_quotas_endpoint_get | Responsable (tester) | QA Automation |
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
| Descripción | Comprobar endpoint GET /api/tickets/courtesy/my-quotas |
| Objetivo | Validar consulta de cuotas asignadas al gestor autenticado |
| Precondiciones | Gestor autenticado |
| Datos de prueba | GET /api/tickets/courtesy/my-quotas |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/tickets/courtesy/my-quotas | HTTP 200 con array JSON | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-062_manager_courtesy_my_quotas_endpoint_get_evidence.json](evidencias/gestor/CP-GES-062_manager_courtesy_my_quotas_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
