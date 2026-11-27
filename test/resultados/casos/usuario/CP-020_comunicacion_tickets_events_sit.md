## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-020 | Fecha de ejecución | 2026-11-16 16:15:15 |
| Nombre de la prueba | comunicacion_tickets_events_sit | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | SIT / Tickets <-> Events Inter-Service | Ambiente | QA / Docker Live Services |
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
| Descripción | Evalúa la comunicación entre laika_tickets (8202) y laika_events (8201) al consultar disponibilidad y asientos ocupados de un evento existente. |
| Objetivo | Garantizar que el servicio de tickets responda adecuadamente sobre un eventId real provisto por el servicio de eventos. |
| Precondiciones | Servicios tickets y events activos en Docker. |
| Datos de prueba | Consulta de eventos publicados y posterior consulta de asientos ocupados en tickets. |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Obtener evento de referencia desde el servicio de eventos | Evento obtenido con ID numérico válido | Event ID seleccionado: 20 ('Vive Latino 2026') | ✓ |
| 2 | Consultar asientos ocupados vía GET /api/tickets/busy-seats/20 | HTTP 200 con array de asientos (strings) | HTTP 200, 23498 asientos ocupados listados | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-020_comunicacion_tickets_events_sit_evidence.json](evidencias/usuario/CP-020_comunicacion_tickets_events_sit_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Coordinación inter-servicio entre laika_tickets y laika_events validada con éxito. |
