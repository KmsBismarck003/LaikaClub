## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-027 | Fecha de ejecución | 2026-11-16 16:14:34 |
| Nombre de la prueba | disponibilidad_tablas_admin_mysql_oat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | OAT / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | OAT |
| Tipo de prueba | Operacional / Base de Datos |
| Técnica | Caja gris |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar disponibilidad de todas las tablas relacionales de laika_admin |
| Objetivo | Verificar presencia de tablas esenciales: system_config, backup_history, ads, restore_events |
| Precondiciones | MySQL 8.0 puerto 3306 |
| Datos de prueba | Database laika_admin |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Verificar tablas maestras de admin | Cero tablas faltantes | Faltantes: [], Total: 12 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-027_disponibilidad_tablas_admin_mysql_oat_evidence.json](evidencias/admin/CP-ADM-027_disponibilidad_tablas_admin_mysql_oat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
