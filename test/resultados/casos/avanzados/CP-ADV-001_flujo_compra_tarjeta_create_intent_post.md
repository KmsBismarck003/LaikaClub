## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-001 | Fecha de ejecución | 2026-11-16 16:15:48 |
| Nombre de la prueba | flujo_compra_tarjeta_create_intent_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Pagos / Checkout | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Pasarela |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar creación de intención de pago con tarjeta en laika_tickets con generación de payment_id |
| Objetivo | Comprobar registro de transacción de pago pendiente antes de confirmación |
| Precondiciones | Servicio laika_tickets activo; usuario autenticado |
| Datos de prueba | Monto: 450.0, Evento: 100001 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar POST create-intent | HTTP 200 OK con payment_id | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-001_flujo_compra_tarjeta_create_intent_post_evidence.json](evidencias/avanzados/CP-ADV-001_flujo_compra_tarjeta_create_intent_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Payment Intent creado: ID=PAY-D65D22, status=pending |
