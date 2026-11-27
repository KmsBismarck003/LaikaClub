## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-049 | Fecha de ejecución | 2026-11-16 16:15:53 |
| Nombre de la prueba | flujo_database_backup_manual_trigger_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Base de Datos / Respaldos | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Operacional / Mantenimiento |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar disparo manual de respaldo completo de la base de datos MySQL por administrador |
| Objetivo | Comprobar registro en historial de backups con identificador único y ejecución asíncrona |
| Precondiciones | Servicio laika_admin activo; credenciales admin |
| Datos de prueba | Ruta: POST /api/database/backup |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Disparar respaldo manual MySQL | HTTP 200 con backup_id generado | HTTP 200 (backup_full_20261116_221553_9a4626) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-049_flujo_database_backup_manual_trigger_post_evidence.json](evidencias/avanzados/CP-ADV-049_flujo_database_backup_manual_trigger_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Respaldo manual disparado exitosamente: backup_full_20261116_221553_9a4626 |
