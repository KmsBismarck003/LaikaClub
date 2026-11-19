## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-008 | Fecha de ejecución | 2026-11-16 16:15:48 |
| Nombre de la prueba | flujo_reembolso_cotizacion_ticket_ajeno_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Reembolsos / Seguridad | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Seguridad / Control de Acceso |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar blindaje de seguridad: rechazo al intentar cotizar reembolso de un boleto ajeno |
| Objetivo | Impedir que un usuario consulte o cancele boletos de terceros (OWASP A01 IDOR) |
| Precondiciones | Boleto 200181 pertenece a otro usuario |
| Datos de prueba | Ticket ID: 200181 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Cotizar boleto ajeno | HTTP 404 o 403 de denegación | HTTP 404 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-008_flujo_reembolso_cotizacion_ticket_ajeno_get_evidence.json](evidencias/avanzados/CP-ADV-008_flujo_reembolso_cotizacion_ticket_ajeno_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Intento de cotización sobre boleto ajeno bloqueado: HTTP 404 |
