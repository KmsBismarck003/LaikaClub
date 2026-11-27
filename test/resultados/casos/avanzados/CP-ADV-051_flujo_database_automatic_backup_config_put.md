## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-051 | Fecha de ejecución | 2026-11-16 16:15:53 |
| Nombre de la prueba | flujo_database_automatic_backup_config_put | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Base de Datos / Auto Backup | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Configuración / Mantenimiento |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar actualización de configuración de respaldos automáticos programados |
| Objetivo | Comprobar persistencia de frecuencia de ejecución, retención de archivos y habilitación |
| Precondiciones | Servicio laika_admin activo; credenciales admin |
| Datos de prueba | Ruta: PUT /api/database/automatic-backup/config |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Actualizar política de auto-respaldos | HTTP 200 con confirmación | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-051_flujo_database_automatic_backup_config_put_evidence.json](evidencias/avanzados/CP-ADV-051_flujo_database_automatic_backup_config_put_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Política de respaldos automáticos actualizada y persistida correctamente |
