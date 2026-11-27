## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-073 | Fecha de ejecución | 2026-11-16 12:56:27 |
| Nombre de la prueba | cupones_usuario_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Gamificación y Cupones | Ambiente | QA / Docker Live Services |
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
| Descripción | Evalúa la obtención de cupones de descuento vigentes y aplicables para el usuario mediante GET /api/achievements/coupons. |
| Objetivo | Verificar que el microservicio responda con código HTTP 200 y una lista con los cupones activos del usuario. |
| Precondiciones | Usuario autenticado. |
| Datos de prueba | Token JWT del usuario de prueba |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar GET /api/achievements/coupons con Bearer token | HTTP 200 OK con lista JSON | HTTP 200 | ✓ |
| 2 | Verificar lista de cupones asignados | Estructura de lista JSON | 3 cupones activos devueltos | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-073_cupones_usuario_endpoint_get_evidence.json](evidencias/CP-073_cupones_usuario_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El motor de recompensas evalúa y entrega los cupones vigentes. |
