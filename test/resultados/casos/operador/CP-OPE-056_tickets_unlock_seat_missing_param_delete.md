## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-056 | Fecha de ejecución | 2026-11-16 16:14:13 |
| Nombre de la prueba | tickets_unlock_seat_missing_param_delete | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Validación / REST |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar que DELETE /api/tickets/lock rechace solicitudes con 400 Bad Request sin seatId. |
| Objetivo | Garantizar validación estricta al liberar asientos bloqueados en taquilla |
| Precondiciones | Servicio laika_tickets activo; token de operador |
| Datos de prueba | Payload sin seatId |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar DELETE /api/tickets/lock sin seatId | HTTP 400 Bad Request | HTTP 400 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-056_tickets_unlock_seat_missing_param_delete_evidence.json](evidencias/operador/CP-OPE-056_tickets_unlock_seat_missing_param_delete_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | 400 Bad Request validado: {"timestamp":"2026-11-16T22:14:14.003+00:00","status":400,"error":"Bad Request", |
