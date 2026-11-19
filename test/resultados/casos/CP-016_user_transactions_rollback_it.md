## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-016 | Fecha de ejecución | 2026-11-16 12:56:36 |
| Nombre de la prueba | user_transactions_rollback_it | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Base de Datos / Transacciones ACID | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | IT |
| Tipo de prueba | Integración |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa el soporte transaccional ACID de MySQL InnoDB mediante una transacción de prueba con rollback forzado. |
| Objetivo | Garantizar que transacciones fallidas o abortadas no persistan registros en la base de datos. |
| Precondiciones | MySQL InnoDB activo en la base de datos laika_auth. |
| Datos de prueba | Inserción de usuario temporal 'rollback_test_user@laikaclub.com' con rollback |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Insertar registro en transacción no confirmada (uncommitted) | Inserción ejecutada en sesión | Inserción exitosa | ✓ |
| 2 | Ejecutar comando ROLLBACK explícito | Transacción revertida | Rollback exitoso | ✓ |
| 3 | Comprobar ausencia del registro 'rollback_test_temp@laikaclub.com' en laika_auth.users | Registro no debe existir (None) | Resultado: No existe (Rollback íntegro) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-016_user_transactions_rollback_it_evidence.json](evidencias/CP-016_user_transactions_rollback_it_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Motor InnoDB respeta estrictamente la atomicidad y aislamiento de transacciones. |
