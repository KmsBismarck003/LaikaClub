## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-044 | Fecha de ejecución | 2026-11-16 16:15:31 |
| Nombre de la prueba | validacion_id_invalido_borrado_backup_usability | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | USABILITY / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | USABILITY |
| Tipo de prueba | Usabilidad / Validación Entradas |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar validación de formato al intentar borrar respaldo con ID inválido |
| Objetivo | Garantizar rechazo con HTTP 400 Bad Request si el backupId contiene caracteres no permitidos |
| Precondiciones | Admin autenticado |
| Datos de prueba | DELETE /api/database/backups/invalid!@#$ |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Solicitar borrado con ID inválido | HTTP 400 o 404 | HTTP 400 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-044_validacion_id_invalido_borrado_backup_usability_evidence.json](evidencias/admin/CP-ADM-044_validacion_id_invalido_borrado_backup_usability_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
