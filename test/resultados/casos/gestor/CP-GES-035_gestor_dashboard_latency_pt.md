## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-035 | Fecha de ejecución | 2026-11-16 16:14:48 |
| Nombre de la prueba | gestor_dashboard_latency_pt | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | PT / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | PT |
| Tipo de prueba | Rendimiento / Latencia |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Medir tiempo de respuesta en dashboard analítico del gestor |
| Objetivo | Garantizar latencia < 800ms en /api/stats/manager/dashboard |
| Precondiciones | Gestor autenticado |
| Datos de prueba | GET /api/stats/manager/dashboard |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Medir latencia en dashboard gestor | < 800ms | 46.51ms | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-035_gestor_dashboard_latency_pt_evidence.json](evidencias/gestor/CP-GES-035_gestor_dashboard_latency_pt_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
