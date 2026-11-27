## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-014 | Fecha de ejecución | 2026-11-16 16:15:01 |
| Nombre de la prueba | gateway_admin_stats_sit | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | SIT / Admin | Ambiente | QA / Docker Live Services |
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
| Descripción | Comprobar integración Gateway -> Stats Microservice para métricas de admin |
| Objetivo | Verificar acceso a métricas ejecutivas de ventas y usuarios |
| Precondiciones | Admin autenticado |
| Datos de prueba | GET /api/stats/admin/dashboard |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/stats/admin/dashboard | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar métricas consolidadas | totalUsers y totalSales presentes | Users: 30062 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-014_gateway_admin_stats_sit_evidence.json](evidencias/admin/CP-ADM-014_gateway_admin_stats_sit_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
