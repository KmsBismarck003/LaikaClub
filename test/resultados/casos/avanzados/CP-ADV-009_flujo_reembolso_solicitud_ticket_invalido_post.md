## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-009 | Fecha de ejecución | 2026-11-16 16:15:48 |
| Nombre de la prueba | flujo_reembolso_solicitud_ticket_invalido_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Reembolsos / Validación | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Validación / Negativo |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar validación de parámetros: rechazo en POST /refunds/request ante ticketId nulo |
| Objetivo | Garantizar consistencia en la formalización de solicitudes de reembolso |
| Precondiciones | Servicio laika_tickets activo; usuario autenticado |
| Datos de prueba | Payload: {'reason': 'test'} |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar solicitud de reembolso incompleta | HTTP 400 Bad Request | HTTP 400 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-009_flujo_reembolso_solicitud_ticket_invalido_post_evidence.json](evidencias/avanzados/CP-ADV-009_flujo_reembolso_solicitud_ticket_invalido_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Validación estricta confirmada: {"timestamp":"2026-11-16T22:15:48.272+00:00","status":400,"error":"Bad Request", |
