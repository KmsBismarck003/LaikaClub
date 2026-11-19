## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-046 | Fecha de ejecución | 2026-11-16 16:14:13 |
| Nombre de la prueba | staff_redeem_invalid_ticket_post | Responsable (tester) | QA Automation |
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
| Descripción | Validar que la tentativa de canje en POST /api/staff/redeem con ticket inválido sea rechazada. |
| Objetivo | Comprobar que no se otorgue acceso a boletos espurios o no registrados |
| Precondiciones | Servicio laika_tickets activo; token de operador |
| Datos de prueba | Ticket: TKT-NONEXISTENT-9999 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar canje de boleto inexistente | Rechazo seguro (no valid=true) | HTTP 500 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-046_staff_redeem_invalid_ticket_post_evidence.json](evidencias/operador/CP-OPE-046_staff_redeem_invalid_ticket_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Rechazo seguro validado: HTTP 500 |
