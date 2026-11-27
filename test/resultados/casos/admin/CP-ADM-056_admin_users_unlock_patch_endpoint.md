## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-056 | Fecha de ejecución | 2026-11-16 16:13:56 |
| Nombre de la prueba | admin_users_unlock_patch_endpoint | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Operaciones |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint PATCH /api/admin/users/{userId}/unlock |
| Objetivo | Garantizar desbloqueo administrativo de cuentas bloqueadas por fuerza bruta |
| Precondiciones | Admin autenticado |
| Datos de prueba | PATCH /api/admin/users/{userId}/unlock |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | PATCH /unlock | HTTP 200 | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-056_admin_users_unlock_patch_endpoint_evidence.json](evidencias/admin/CP-ADM-056_admin_users_unlock_patch_endpoint_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
