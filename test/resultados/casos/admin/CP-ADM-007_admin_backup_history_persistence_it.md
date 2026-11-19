## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-007 | Fecha de ejecución | 2026-11-16 16:14:27 |
| Nombre de la prueba | admin_backup_history_persistence_it | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | IT / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | IT |
| Tipo de prueba | Persistencia Repositorio |
| Técnica | Caja gris |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar persistencia de registros en backup_history |
| Objetivo | Verificar lectura de registros históricos de respaldos en la base de datos |
| Precondiciones | Tabla laika_admin.backup_history |
| Datos de prueba | Campos id, backup_id, status |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar backup_history en MySQL | Registros > 0 | Obtenidos: 5 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-007_admin_backup_history_persistence_it_evidence.json](evidencias/admin/CP-ADM-007_admin_backup_history_persistence_it_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
