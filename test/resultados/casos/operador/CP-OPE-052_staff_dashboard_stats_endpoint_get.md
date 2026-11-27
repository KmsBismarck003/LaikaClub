## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-052 | Fecha de ejecución | 2026-11-16 16:14:12 |
| Nombre de la prueba | staff_dashboard_stats_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Dashboard |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar que GET /api/stats/staff/dashboard devuelva métricas operativas del tablero de control. |
| Objetivo | Comprobar disponibilidad de indicadores de aforo y lecturas para staff |
| Precondiciones | Servicio laika_stats activo; token de operador |
| Datos de prueba | N/A |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar GET /api/stats/staff/dashboard | HTTP 200 OK | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-052_staff_dashboard_stats_endpoint_get_evidence.json](evidencias/operador/CP-OPE-052_staff_dashboard_stats_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | 200 OK verificado: totalScanned=0, validScans=0 |
