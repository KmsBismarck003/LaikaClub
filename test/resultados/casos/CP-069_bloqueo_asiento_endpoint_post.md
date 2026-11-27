## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-069 | Fecha de ejecución | 2026-11-16 12:56:21 |
| Nombre de la prueba | bloqueo_asiento_endpoint_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Bloqueo Concurrente | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa el bloqueo de un asiento mediante POST /api/tickets/lock con parámetros eventId, seatId, sectionName y price. |
| Objetivo | Verificar que el servicio responda con código HTTP 200 y confirme el bloqueo del asiento. |
| Precondiciones | Usuario autenticado. |
| Datos de prueba | Event ID: 19, Seat ID: 'QA-API-LOCK-01', Precio: 450.0 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar POST /api/tickets/lock con payload de asiento | HTTP 200 OK | HTTP 200 | ✓ |
| 2 | Liberar asiento tras validación | Asiento desbloqueado | Liberado | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-069_bloqueo_asiento_endpoint_post_evidence.json](evidencias/CP-069_bloqueo_asiento_endpoint_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El endpoint de bloqueo registra la reserva temporal con éxito. |
