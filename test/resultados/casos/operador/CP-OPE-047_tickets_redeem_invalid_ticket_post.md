## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-047 | Fecha de ejecución | 2026-11-16 16:14:13 |
| Nombre de la prueba | tickets_redeem_invalid_ticket_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Negativo |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar que la ruta canónica POST /api/tickets/redeem mantenga rechazo ante códigos espurios. |
| Objetivo | Comprobar integridad transaccional de canje en microservicio laika_tickets |
| Precondiciones | Servicio laika_tickets activo |
| Datos de prueba | Ticket: TKT-FAKE-CODE-000 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar POST /api/tickets/redeem espurio | Rechazo transaccional | HTTP 500 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-047_tickets_redeem_invalid_ticket_post_evidence.json](evidencias/operador/CP-OPE-047_tickets_redeem_invalid_ticket_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Rechazo transaccional validado: HTTP 500 |
