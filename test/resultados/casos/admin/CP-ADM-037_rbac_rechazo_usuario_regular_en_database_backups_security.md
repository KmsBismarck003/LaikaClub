## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-037 | Fecha de ejecución | 2026-11-16 16:14:59 |
| Nombre de la prueba | rbac_rechazo_usuario_regular_en_database_backups_security | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | SECURITY / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SECURITY |
| Tipo de prueba | Seguridad / Control de Acceso |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Auditar protección del endpoint de respaldos de base de datos ante usuarios no administradores |
| Objetivo | Verificar si un usuario regular puede disparar o listar respaldos críticos |
| Precondiciones | Token de usuario regular |
| Datos de prueba | POST /api/database/backup |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Usuario regular intenta listar backups | HTTP 401/403/Access Denied | HTTP 403 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-037_rbac_rechazo_usuario_regular_en_database_backups_security_evidence.json](evidencias/admin/CP-ADM-037_rbac_rechazo_usuario_regular_en_database_backups_security_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
