## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-004 | Fecha de ejecución | 2026-11-16 16:15:48 |
| Nombre de la prueba | flujo_compra_evento_caducado_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Compras / Temporalidad | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Reglas de Negocio |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar control de admisión temporal: rechazar compra en evento con fecha pasada o caducada |
| Objetivo | Impedir venta extemporánea de boletaje |
| Precondiciones | Servicio laika_tickets activo; Evento 19 histórico |
| Datos de prueba | Evento ID: 19 (fecha pasada) |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Intentar compra en evento caducado | Rechazo controlado (HTTP 4xx) | HTTP 403 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-004_flujo_compra_evento_caducado_post_evidence.json](evidencias/avanzados/CP-ADV-004_flujo_compra_evento_caducado_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Venta en evento caducado denegada correctamente: HTTP 403 |
