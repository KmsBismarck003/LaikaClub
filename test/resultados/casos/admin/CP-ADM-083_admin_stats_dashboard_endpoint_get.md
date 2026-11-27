## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-083 | Fecha de ejecución | 2026-11-16 16:13:54 |
| Nombre de la prueba | admin_stats_dashboard_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Admin | Ambiente | QA / Docker Live Services |
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
| Descripción | Comprobar endpoint GET /api/stats/admin/dashboard para resumen ejecutivo |
| Objetivo | Validar respuesta HTTP 200 con totalUsers, totalEvents y totalSales |
| Precondiciones | Admin autenticado |
| Datos de prueba | GET /api/stats/admin/dashboard |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/stats/admin/dashboard | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar claves maestras de métricas | totalUsers y totalSales presentes | totalUsers=30060 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-083_admin_stats_dashboard_endpoint_get_evidence.json](evidencias/admin/CP-ADM-083_admin_stats_dashboard_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
