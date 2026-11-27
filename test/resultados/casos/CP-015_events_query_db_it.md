## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-015 | Fecha de ejecución | 2026-11-16 12:56:34 |
| Nombre de la prueba | events_query_db_it | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Eventos / Catálogo e Hidratación MySQL | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | IT |
| Tipo de prueba | Integración |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa la correspondencia entre los eventos publicados retornados por el servicio de eventos y los registros en MySQL. |
| Objetivo | Garantizar que solo eventos con status 'published' sean expuestos en el endpoint público. |
| Precondiciones | Microservicio laika_events (puerto 8201) y base de datos laika_events activos sin mocks. |
| Datos de prueba | Consulta pública: GET /api/events/public |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consumir endpoint GET /api/events/public?limit=50 | HTTP 200 con listado de eventos | HTTP 200, 4 eventos devueltos | ✓ |
| 2 | Consultar eventos con status='published' directamente en laika_events.events | Registros publicados encontrados en MySQL | 14 eventos publicados en base de datos | ✓ |
| 3 | Validar correlación de IDs entre la respuesta API y los registros de MySQL | Intersección de IDs positiva y consistente | 4 IDs coincidentes entre API y DB | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-015_events_query_db_it_evidence.json](evidencias/CP-015_events_query_db_it_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | La capa de persistencia hidrata correctamente los modelos de dominio de eventos. |
