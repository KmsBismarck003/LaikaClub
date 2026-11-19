## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-056 | Fecha de ejecución | 2026-11-16 16:14:04 |
| Nombre de la prueba | manager_event_revenue_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Finanzas |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint GET /api/manager/events/{id}/revenue |
| Objetivo | Validar desglose de ingresos brutos, netos y proyectados |
| Precondiciones | Evento ID 100001 |
| Datos de prueba | GET /api/manager/events/100001/revenue |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/manager/events/100001/revenue | HTTP 200 con gross y net | HTTP 200, gross=7200.0 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-056_manager_event_revenue_endpoint_get_evidence.json](evidencias/gestor/CP-GES-056_manager_event_revenue_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
