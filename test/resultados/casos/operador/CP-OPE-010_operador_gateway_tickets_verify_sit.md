## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-010 | Fecha de ejecución | 2026-11-16 16:15:15 |
| Nombre de la prueba | operador_gateway_tickets_verify_sit | Responsable (tester) | QA Automation |
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
| Descripción | Comprobar comunicación Gateway -> Tickets Service (/api/tickets/verify) |
| Objetivo | Garantizar enrutamiento y validación óptica de boleto en vivo |
| Precondiciones | Gateway activo en puerto 8000 |
| Datos de prueba | POST /api/tickets/verify |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Petición verify a través del Gateway | HTTP 200 con statusCode | HTTP 200, status=FUTURE_EVENT | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-010_operador_gateway_tickets_verify_sit_evidence.json](evidencias/operador/CP-OPE-010_operador_gateway_tickets_verify_sit_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
