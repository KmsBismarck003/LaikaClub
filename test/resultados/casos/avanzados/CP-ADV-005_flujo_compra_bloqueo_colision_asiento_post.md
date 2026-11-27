## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-005 | Fecha de ejecución | 2026-11-16 16:15:48 |
| Nombre de la prueba | flujo_compra_bloqueo_colision_asiento_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Compras / Concurrencia | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Concurrencia / Asientos |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar control de concurrencia y prevención de colisión al bloquear un asiento ya reservado |
| Objetivo | Garantizar que dos clientes no puedan retener la misma butaca simultáneamente |
| Precondiciones | Servicio laika_tickets activo |
| Datos de prueba | Asiento: LOCK-CONCUR-01 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Primer bloqueo de asiento | Procesado | HTTP 200 | ✓ |
| 2 | Segundo bloqueo concurrente del mismo asiento | Manejo seguro | HTTP 409 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-005_flujo_compra_bloqueo_colision_asiento_post_evidence.json](evidencias/avanzados/CP-ADV-005_flujo_compra_bloqueo_colision_asiento_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Bloqueo 1: 200, Bloqueo 2: 409 |
