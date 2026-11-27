## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-012 | Fecha de ejecución | 2026-11-16 16:15:01 |
| Nombre de la prueba | gateway_admin_config_sit | Responsable (tester) | QA Automation |
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
| Descripción | Comprobar integración Gateway -> Admin para /api/config |
| Objetivo | Verificar lectura de configuración runtime a través de la pasarela |
| Precondiciones | Admin autenticado |
| Datos de prueba | GET /api/config |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/config a través de Gateway | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar parámetros de configuración | Parámetros globales presentes | Keys: ['registrationEnabled', 'maxTicketsPerUser', 'sessionTimeout', 'maintenanceMode'] | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-012_gateway_admin_config_sit_evidence.json](evidencias/admin/CP-ADM-012_gateway_admin_config_sit_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
