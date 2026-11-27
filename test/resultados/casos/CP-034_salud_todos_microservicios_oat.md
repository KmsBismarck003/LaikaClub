## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-034 | Fecha de ejecución | 2026-11-16 12:56:36 |
| Nombre de la prueba | salud_todos_microservicios_oat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | OAT / Monitoreo y Salud de Microservicios | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | OAT |
| Tipo de prueba | Operacional / Disponibilidad |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Audita de forma independiente el endpoint /health de cada microservicio Spring Boot en su puerto directo. |
| Objetivo | Garantizar que todos los servicios de misión crítica reporten estado vivo o saludable (alive / healthy / ok). |
| Precondiciones | Contenedores Docker de los 8 microservicios en ejecución. |
| Datos de prueba | Endpoints /health directos en puertos 8101..8302 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Health check de 'laika_auth' (http://localhost:8101/health) | HTTP 200 OK con payload de salud | HTTP 200, Payload: alive | ✓ |
| 2 | Health check de 'laika_admin' (http://localhost:8102/health) | HTTP 200 OK con payload de salud | HTTP 200, Payload: alive | ✓ |
| 3 | Health check de 'laika_stats' (http://localhost:8103/health) | HTTP 200 OK con payload de salud | HTTP 200, Payload: alive | ✓ |
| 4 | Health check de 'laika_events' (http://localhost:8201/health) | HTTP 200 OK con payload de salud | HTTP 200, Payload: healthy | ✓ |
| 5 | Health check de 'laika_tickets' (http://localhost:8202/health) | HTTP 200 OK con payload de salud | HTTP 200, Payload: alive | ✓ |
| 6 | Health check de 'laika_merchandise' (http://localhost:8203/health) | HTTP 200 OK con payload de salud | HTTP 200, Payload: ok | ✓ |
| 7 | Health check de 'laika_achievements' (http://localhost:8301/health) | HTTP 200 OK con payload de salud | HTTP 200, Payload: healthy | ✓ |
| 8 | Health check de 'laika_analytics' (http://localhost:8302/health) | HTTP 200 OK con payload de salud | HTTP 200, Payload: healthy | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-034_salud_todos_microservicios_oat_evidence.json](evidencias/CP-034_salud_todos_microservicios_oat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Todos los microservicios Java Spring Boot responden al sondeo de salud operacional. |
