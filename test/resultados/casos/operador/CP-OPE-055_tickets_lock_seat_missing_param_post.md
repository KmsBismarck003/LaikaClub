## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-055 | Fecha de ejecución | 2026-11-16 16:14:13 |
| Nombre de la prueba | tickets_lock_seat_missing_param_post | Responsable (tester) | QA Automation |
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
| Descripción | Validar que POST /api/tickets/lock rechace solicitudes incompletas con 400 Bad Request. |
| Objetivo | Garantizar validación estricta de parámetros en bloqueo de asientos para taquilla |
| Precondiciones | Servicio laika_tickets activo; token de operador |
| Datos de prueba | Payload sin seatId |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar POST /api/tickets/lock sin seatId | HTTP 400 Bad Request | HTTP 400 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-055_tickets_lock_seat_missing_param_post_evidence.json](evidencias/operador/CP-OPE-055_tickets_lock_seat_missing_param_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | 400 Bad Request validado: {"timestamp":"2026-11-16T22:14:13.860+00:00","status":400,"error":"Bad Request", |
