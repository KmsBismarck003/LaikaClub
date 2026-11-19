## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-068 | Fecha de ejecución | 2026-11-16 16:13:52 |
| Nombre de la prueba | admin_database_auto_backup_config_endpoint_get | Responsable (tester) | QA Automation |
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
| Descripción | Comprobar endpoint GET /api/database/automatic-backup/config |
| Objetivo | Validar respuesta HTTP 200 y configuración de respaldos automáticos |
| Precondiciones | Admin autenticado |
| Datos de prueba | GET /api/database/automatic-backup/config |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/database/automatic-backup/config | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar objeto config | config presente | data={'lastBackup': '2026-11-16T22:12:58', 'nextBackup': '2026-11-17T03:00', 'config': {'enabled': True, 'frequency': 'daily', 'time': '03:00', 'backupType': 'completo', 'retentionDays': 15, 'maxBackups': 10, 'notifyOnSuccess': True, 'notifyOnError': True, 'dayOfWeek': 0, 'dayOfMonth': 1}} | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-068_admin_database_auto_backup_config_endpoint_get_evidence.json](evidencias/admin/CP-ADM-068_admin_database_auto_backup_config_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
