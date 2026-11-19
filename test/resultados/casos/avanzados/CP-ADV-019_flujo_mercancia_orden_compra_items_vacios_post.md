## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-019 | Fecha de ejecución | 2026-11-16 16:15:52 |
| Nombre de la prueba | flujo_mercancia_orden_compra_items_vacios_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Mercancía / Pedidos | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Validación / Carrito |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar integridad de orden de compra: rechazo de pedido de mercancía con carrito vacío |
| Objetivo | Garantizar que no se generen órdenes sin artículos en laika_merchandise |
| Precondiciones | Servicio laika_merchandise activo |
| Datos de prueba | items: [] |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar orden de mercancía sin artículos | HTTP 4xx de rechazo | HTTP 401 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-019_flujo_mercancia_orden_compra_items_vacios_post_evidence.json](evidencias/avanzados/CP-ADV-019_flujo_mercancia_orden_compra_items_vacios_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Orden vacía rechazada correctamente: HTTP 401 |
