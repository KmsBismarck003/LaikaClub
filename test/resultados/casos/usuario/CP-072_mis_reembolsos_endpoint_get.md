## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-072 | Fecha de ejecución | 2026-11-16 16:14:12 |
| Nombre de la prueba | mis_reembolsos_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Rastreador de Reembolsos | Ambiente | QA / Docker Live Services |
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
| Descripción | Evalúa el listado de devoluciones solicitadas por el usuario actual mediante GET /api/tickets/refund/my-refunds. |
| Objetivo | Garantizar que el servicio responda con código HTTP 200 y una lista de solicitudes registradas. |
| Precondiciones | Usuario autenticado. |
| Datos de prueba | Token JWT del usuario de prueba |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar GET /api/tickets/refund/my-refunds | HTTP 200 OK con lista JSON | HTTP 200 | ✓ |
| 2 | Verificar estructura de lista JSON devuelta | Tipo lista devuelto | Tipo: list, Conteo: 0 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-072_mis_reembolsos_endpoint_get_evidence.json](evidencias/usuario/CP-072_mis_reembolsos_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El endpoint expone la información histórica de cancelaciones de forma segura. |
