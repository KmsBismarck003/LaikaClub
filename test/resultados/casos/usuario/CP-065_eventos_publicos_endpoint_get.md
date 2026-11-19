## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-065 | Fecha de ejecución | 2026-11-16 16:14:03 |
| Nombre de la prueba | eventos_publicos_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Catálogo de Eventos | Ambiente | QA / Docker Live Services |
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
| Descripción | Evalúa la obtención del catálogo público de eventos cartelera mediante GET /api/events/public. |
| Objetivo | Verificar que el servicio responda con código HTTP 200 y una lista de eventos publicados con sus datos de fecha y precio. |
| Precondiciones | Servicio de eventos activo. |
| Datos de prueba | Parámetro limit=10 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar GET /api/events/public?limit=10 | HTTP 200 OK con lista JSON | HTTP 200 | ✓ |
| 2 | Verificar respeto del límite (limit <= 10) | Array con máximo 10 elementos | 4 eventos retornados | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-065_eventos_publicos_endpoint_get_evidence.json](evidencias/usuario/CP-065_eventos_publicos_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El catálogo de eventos responde con rapidez y respeta los filtros de paginación. |
