## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-012 | Fecha de ejecución | 2026-11-16 16:15:15 |
| Nombre de la prueba | operador_gateway_validations_history_sit | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | SIT / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SIT |
| Tipo de prueba | Integración de Sistema |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar comunicación Gateway -> Tickets Service (/api/tickets/validations/history) |
| Objetivo | Garantizar recuperación de bitácora histórica de validaciones |
| Precondiciones | Servicio Tickets activo |
| Datos de prueba | GET /api/tickets/validations/history |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar historial de validaciones | HTTP 200 con lista JSON | HTTP 200, total=234 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-012_operador_gateway_validations_history_sit_evidence.json](evidencias/operador/CP-OPE-012_operador_gateway_validations_history_sit_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
