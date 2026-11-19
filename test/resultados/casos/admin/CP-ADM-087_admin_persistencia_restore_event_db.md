## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-087 | Fecha de ejecución | 2026-11-16 16:14:16 |
| Nombre de la prueba | admin_persistencia_restore_event_db | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | DATABASE / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | DATABASE |
| Tipo de prueba | Integridad Transaccional |
| Técnica | Caja gris |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar integridad transaccional e inserción directa en la tabla restore_events |
| Objetivo | Garantizar que las columnas de severidad y ambiente cumplan con las restricciones de MySQL |
| Precondiciones | MySQL 8.0 tabla laika_admin.restore_events |
| Datos de prueba | INSERT e integridad |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Insertar evento de restauración de prueba en MySQL | Inserción exitosa | OK | ✓ |
| 2 | Verificar persistencia del registro | Fila recuperada | Fila: [{'id': 9, 'environment': 'qa', 'severity': 'critical', 'restore_reason': 'Prueba QA Automation'}] | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-087_admin_persistencia_restore_event_db_evidence.json](evidencias/admin/CP-ADM-087_admin_persistencia_restore_event_db_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
