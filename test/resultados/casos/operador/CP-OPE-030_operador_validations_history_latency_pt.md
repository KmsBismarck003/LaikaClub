## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-030 | Fecha de ejecución | 2026-11-16 16:14:49 |
| Nombre de la prueba | operador_validations_history_latency_pt | Responsable (tester) | QA Automation |
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
| Descripción | Medir tiempo de respuesta en consulta de bitácora histórica de validaciones |
| Objetivo | Garantizar latencia < 500ms en /api/tickets/validations/history |
| Precondiciones | Operador autenticado |
| Datos de prueba | GET /api/tickets/validations/history |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Medir latencia en historial de validaciones | < 500ms | 37.55ms | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-030_operador_validations_history_latency_pt_evidence.json](evidencias/operador/CP-OPE-030_operador_validations_history_latency_pt_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
