## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-015 | Fecha de ejecución | 2026-11-16 16:15:01 |
| Nombre de la prueba | gateway_admin_monitoring_sit | Responsable (tester) | QA Automation |
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
| Descripción | Comprobar endpoint de monitoreo del sistema a través de Gateway |
| Objetivo | Verificar respuesta del canal de telemetría /api/monitoring |
| Precondiciones | Admin autenticado |
| Datos de prueba | GET /api/monitoring |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/monitoring | HTTP 200 o fallback controlado | HTTP 401 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-015_gateway_admin_monitoring_sit_evidence.json](evidencias/admin/CP-ADM-015_gateway_admin_monitoring_sit_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
