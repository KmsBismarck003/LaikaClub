## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-061 | Fecha de ejecución | 2026-11-16 16:14:05 |
| Nombre de la prueba | manager_stats_dashboard_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Analítica |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint GET /api/stats/manager/dashboard |
| Objetivo | Validar KPIs ejecutivos para panel de control del gestor |
| Precondiciones | Gestor autenticado |
| Datos de prueba | GET /api/stats/manager/dashboard |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/stats/manager/dashboard | HTTP 200 con datos analíticos | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-061_manager_stats_dashboard_endpoint_get_evidence.json](evidencias/gestor/CP-GES-061_manager_stats_dashboard_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
