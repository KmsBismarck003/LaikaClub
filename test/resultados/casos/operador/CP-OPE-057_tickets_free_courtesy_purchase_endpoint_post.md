## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-057 | Fecha de ejecución | 2026-11-16 16:14:13 |
| Nombre de la prueba | tickets_free_courtesy_purchase_endpoint_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Seguridad / Cuotas |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar que POST /api/tickets/free rechace con 403 Forbidden la emisión de cortesías sin cupo. |
| Objetivo | Comprobar blindaje contra emisión no autorizada de cortesías desde terminales |
| Precondiciones | Servicio laika_tickets activo; token de operador |
| Datos de prueba | EventId: 100001 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Intentar emisión de cortesía no habilitada | HTTP 403 Forbidden | HTTP 403 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-057_tickets_free_courtesy_purchase_endpoint_post_evidence.json](evidencias/operador/CP-OPE-057_tickets_free_courtesy_purchase_endpoint_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | 403 Forbidden verificado: Este evento no es gratuito. Usa el flujo de pago normal. |
