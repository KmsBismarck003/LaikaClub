## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-014 | Fecha de ejecución | 2026-11-16 16:15:02 |
| Nombre de la prueba | gestor_gateway_stats_dashboard_sit | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | SIT / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SIT |
| Tipo de prueba | Integración de Sistema |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar comunicación Gateway -> Stats Service (/api/stats/manager/dashboard) |
| Objetivo | Validar entrega de datos consolidados para gráficas de gestión |
| Precondiciones | Stats Service activo |
| Datos de prueba | GET /api/stats/manager/dashboard |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar métricas del dashboard gestor | HTTP 200 con revenue y tickets | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-014_gestor_gateway_stats_dashboard_sit_evidence.json](evidencias/gestor/CP-GES-014_gestor_gateway_stats_dashboard_sit_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
