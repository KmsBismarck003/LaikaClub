## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-028 | Fecha de ejecución | 2026-11-16 12:56:53 |
| Nombre de la prueba | flujo_reserva_bloqueo_asiento_st | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Sistema / Bloqueo Concurrente de Asientos | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | ST |
| Tipo de prueba | Funcional / Sistema |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa la reserva temporal exclusiva de un asiento mediante ReentrantLock en laika_tickets y su posterior liberación controlada. |
| Objetivo | Verificar que el asiento quede bloqueado temporalmente y pueda ser liberado adecuadamente por el usuario. |
| Precondiciones | Usuario autenticado y evento con mapa de asientos activo. |
| Datos de prueba | Event ID: 19, Seat ID: 'QA-ST-TEST-01', Section: 'VIP', Precio: 500.0 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Bloquear asiento 'QA-ST-LOCK-99' para evento 19 | HTTP 200 con confirmación de bloqueo | HTTP 200, Status: success | ✓ |
| 2 | Liberar asiento 'QA-ST-LOCK-99' mediante DELETE /api/tickets/lock | HTTP 200 con confirmación de liberación | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-028_flujo_reserva_bloqueo_asiento_st_evidence.json](evidencias/CP-028_flujo_reserva_bloqueo_asiento_st_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Mecanismo de concurrencia y bloqueo temporal validado sin bloqueos huérfanos. |
