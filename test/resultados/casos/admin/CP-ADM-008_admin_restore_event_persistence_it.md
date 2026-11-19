## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-008 | Fecha de ejecución | 2026-11-16 16:14:27 |
| Nombre de la prueba | admin_restore_event_persistence_it | Responsable (tester) | QA Automation |
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
| Descripción | Comprobar estructura y persistencia en tabla restore_events |
| Objetivo | Verificar acceso y esquema de la tabla de auditoría de restauraciones |
| Precondiciones | Tabla laika_admin.restore_events |
| Datos de prueba | Schema validation |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Verificar columnas de restore_events | environment y severity presentes | Columnas: 17 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-008_admin_restore_event_persistence_it_evidence.json](evidencias/admin/CP-ADM-008_admin_restore_event_persistence_it_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
