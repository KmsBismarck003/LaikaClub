## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-005 | Fecha de ejecución | 2026-11-16 16:15:32 |
| Nombre de la prueba | admin_user_role_transition_ut | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UT / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UT |
| Tipo de prueba | Lógica / Transiciones |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar máquina de estados de cambio de roles |
| Objetivo | Garantizar que solo admin pueda ascender o degradar roles válidos |
| Precondiciones | Roles: usuario, gestor, admin, operador |
| Datos de prueba | Requester role check |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Admin promueve usuario a gestor | True | True (Transición permitida) | ✓ |
| 2 | Gestor intenta promover usuario | False | False (Solo un administrador puede alterar roles) | ✓ |
| 3 | Admin asigna rol inexistente | False | False (Rol objetivo no reconocido: super_god) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-005_admin_user_role_transition_ut_evidence.json](evidencias/admin/CP-ADM-005_admin_user_role_transition_ut_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
