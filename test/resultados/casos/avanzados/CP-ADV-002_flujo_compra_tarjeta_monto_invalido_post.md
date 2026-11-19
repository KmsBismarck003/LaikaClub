## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-002 | Fecha de ejecución | 2026-11-16 16:15:48 |
| Nombre de la prueba | flujo_compra_tarjeta_monto_invalido_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Pagos / Validación | Ambiente | QA / Docker Live Services |
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
| Descripción | Validar rechazo de intención de pago con monto inválido o ausente en POST /payments/create-intent |
| Objetivo | Garantizar control de integridad financiera ante montos espurios |
| Precondiciones | Servicio laika_tickets activo; usuario autenticado |
| Datos de prueba | Monto: 'no-numerico' |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar POST create-intent con monto no numérico | HTTP 400 Bad Request | HTTP 400 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-002_flujo_compra_tarjeta_monto_invalido_post_evidence.json](evidencias/avanzados/CP-ADV-002_flujo_compra_tarjeta_monto_invalido_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Rechazo validado con HTTP 400: {"timestamp":"2026-11-16T22:15:48.986+00:00","status":400,"error":"Bad Request", |
