## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-071 | Fecha de ejecución | 2026-11-16 16:13:57 |
| Nombre de la prueba | compra_boleto_gratuito_endpoint_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Emisión de Boletos Gratuitos | Ambiente | QA / Docker Live Services |
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
| Descripción | Evalúa la generación directa de boleto mediante POST /api/tickets/free para el evento gratuito oficial (ID 24). |
| Objetivo | Verificar que el backend retorne HTTP 200 con status 'success' y emita los boletos en la respuesta. |
| Precondiciones | Usuario autenticado y evento de costo cero disponible. |
| Datos de prueba | Event ID: 24 (Cine Club: Joyas de la Animación), Section: 'General', Cantidad: 1 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar POST /api/tickets/free con eventId=24 | HTTP 200 OK | HTTP 200 | ✓ |
| 2 | Verificar estado 'success' y emisión de boletos en payload | status='success' y tickets array | Status: success, Boletos emitidos: 1 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-071_compra_boleto_gratuito_endpoint_post_evidence.json](evidencias/usuario/CP-071_compra_boleto_gratuito_endpoint_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El servicio de tickets genera el boleto con código QR sin requerir pasarela de pago. |
