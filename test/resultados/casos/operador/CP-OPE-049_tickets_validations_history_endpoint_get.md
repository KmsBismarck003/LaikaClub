## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-049 | Fecha de ejecución | 2026-11-16 16:14:14 |
| Nombre de la prueba | tickets_validations_history_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Auditoría |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar que la ruta canónica GET /api/tickets/validations/history entregue la lista de auditoría. |
| Objetivo | Comprobar contrato de endpoint de validaciones históricas |
| Precondiciones | Servicio laika_tickets activo |
| Datos de prueba | N/A |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar GET /api/tickets/validations/history | HTTP 200 OK | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-049_tickets_validations_history_endpoint_get_evidence.json](evidencias/operador/CP-OPE-049_tickets_validations_history_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | 200 OK obtenido con 220 registros |
