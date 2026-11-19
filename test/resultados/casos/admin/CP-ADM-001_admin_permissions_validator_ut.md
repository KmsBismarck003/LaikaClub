## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-001 | Fecha de ejecución | 2026-11-16 16:15:32 |
| Nombre de la prueba | admin_permissions_validator_ut | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UT / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UT |
| Tipo de prueba | Lógica / Permisos |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar función de evaluación de matriz de permisos de administrador |
| Objetivo | Garantizar que se verifiquen todos los permisos críticos |
| Precondiciones | Definición de permisos requeridos |
| Datos de prueba | {canViewDashboard: True, ...} |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Validar permisos completos | is_valid == True | is_valid=True | ✓ |
| 2 | Validar permisos incompletos | is_valid == False | is_valid=False, missing=['canCreateEvents', 'canEditEvents', 'canManageUsers'] | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-001_admin_permissions_validator_ut_evidence.json](evidencias/admin/CP-ADM-001_admin_permissions_validator_ut_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
