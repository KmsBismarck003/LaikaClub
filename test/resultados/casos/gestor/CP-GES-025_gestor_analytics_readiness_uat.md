## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-025 | Fecha de ejecución | 2026-11-16 16:15:28 |
| Nombre de la prueba | gestor_analytics_readiness_uat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UAT / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UAT |
| Tipo de prueba | Aceptación / Analítica |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar preparación de métricas para dashboard del gestor |
| Objetivo | Garantizar que existan series temporales para Recharts/Plotly |
| Precondiciones | Endpoint analítico |
| Datos de prueba | GET /api/stats/manager/dashboard |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Inspección de datos analíticos | HTTP 200 con labels y series de ingresos | HTTP 200, labels=7 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-025_gestor_analytics_readiness_uat_evidence.json](evidencias/gestor/CP-GES-025_gestor_analytics_readiness_uat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
