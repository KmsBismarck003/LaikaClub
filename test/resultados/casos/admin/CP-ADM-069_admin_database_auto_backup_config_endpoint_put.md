## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-069 | Fecha de ejecución | 2026-11-16 16:13:52 |
| Nombre de la prueba | admin_database_auto_backup_config_endpoint_put | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Configuración |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint PUT /api/database/automatic-backup/config |
| Objetivo | Garantizar actualización de parámetros de respaldos automáticos |
| Precondiciones | Admin autenticado |
| Datos de prueba | PUT /api/database/automatic-backup/config |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | PUT /api/database/automatic-backup/config | HTTP 200 | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-069_admin_database_auto_backup_config_endpoint_put_evidence.json](evidencias/admin/CP-ADM-069_admin_database_auto_backup_config_endpoint_put_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
