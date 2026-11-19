## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-003 | Fecha de ejecución | 2026-11-16 16:15:48 |
| Nombre de la prueba | flujo_compra_evento_inexistente_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Compras / Límites | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Integridad / Negativo |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar rechazo controlado al intentar comprar o reservar en un evento inexistente |
| Objetivo | Garantizar consistencia ante solicitudes de eventos no registrados |
| Precondiciones | Servicio laika_tickets activo |
| Datos de prueba | Evento ID: 999999 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Intentar compra en evento inexistente | HTTP rechazo (4xx/503) | HTTP 503 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-003_flujo_compra_evento_inexistente_post_evidence.json](evidencias/avanzados/CP-ADV-003_flujo_compra_evento_inexistente_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Rechazo correcto ante evento inexistente: HTTP 503 |
