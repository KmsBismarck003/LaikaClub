## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-014 | Fecha de ejecución | 2026-11-16 16:15:15 |
| Nombre de la prueba | operador_gateway_busy_seats_sit | Responsable (tester) | QA Automation |
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
| Descripción | Comprobar comunicación Gateway -> Tickets Service (/api/tickets/busy-seats/{eventId}) |
| Objetivo | Verificar consulta de asientos ocupados para el evento 100001 |
| Precondiciones | Evento 100001 publicado |
| Datos de prueba | GET /api/tickets/busy-seats/100001 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar asientos ocupados | HTTP 200 con lista JSON | HTTP 200, total=4 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-014_operador_gateway_busy_seats_sit_evidence.json](evidencias/operador/CP-OPE-014_operador_gateway_busy_seats_sit_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
