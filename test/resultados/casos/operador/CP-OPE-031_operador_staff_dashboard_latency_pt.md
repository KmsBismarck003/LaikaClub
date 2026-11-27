## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-031 | Fecha de ejecución | 2026-11-16 16:14:49 |
| Nombre de la prueba | operador_staff_dashboard_latency_pt | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | PT / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | PT |
| Tipo de prueba | Rendimiento / Latencia |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Medir tiempo de respuesta en métricas de staff |
| Objetivo | Garantizar latencia < 500ms en /api/stats/staff/dashboard |
| Precondiciones | Operador autenticado |
| Datos de prueba | GET /api/stats/staff/dashboard |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Medir latencia en dashboard de staff | < 500ms | 39.04ms | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-031_operador_staff_dashboard_latency_pt_evidence.json](evidencias/operador/CP-OPE-031_operador_staff_dashboard_latency_pt_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
