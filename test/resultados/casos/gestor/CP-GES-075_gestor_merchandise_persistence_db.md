## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-075 | Fecha de ejecución | 2026-11-16 16:14:17 |
| Nombre de la prueba | gestor_merchandise_persistence_db | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | DATABASE / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | DATABASE |
| Tipo de prueba | Persistencia / Base de datos |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar persistencia de productos en laika_merchandise.merchandise_items |
| Objetivo | Validar vinculación entre producto y manager_id = 3 |
| Precondiciones | Base de datos laika_merchandise |
| Datos de prueba | SELECT id, name, manager_id FROM merchandise_items |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Verificar persistencia de artículos del gestor 3 | Productos vinculados a manager_id=3 | Total: 2 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-075_gestor_merchandise_persistence_db_evidence.json](evidencias/gestor/CP-GES-075_gestor_merchandise_persistence_db_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
