## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-022 | Fecha de ejecución | 2026-11-16 16:15:30 |
| Nombre de la prueba | operador_staff_analytics_readiness_uat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UAT / Operador | Ambiente | QA / Docker Live Services |
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
| Descripción | Comprobar disponibilidad de gráficas de flujo de acceso para la terminal |
| Objetivo | Garantizar entrega de scansPerHour y etiquetas para Recharts/Plotly |
| Precondiciones | Dashboard de staff |
| Datos de prueba | GET /api/stats/staff/dashboard |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Inspección de datos analíticos de torniquete | HTTP 200 con serie scansPerHour | HTTP 200, puntos=7 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-022_operador_staff_analytics_readiness_uat_evidence.json](evidencias/operador/CP-OPE-022_operador_staff_analytics_readiness_uat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
