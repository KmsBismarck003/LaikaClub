## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-045 | Fecha de ejecución | 2026-11-16 16:15:47 |
| Nombre de la prueba | flujo_auth_desbloqueo_cuenta_admin_patch | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Seguridad / Desbloqueo | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SECURITY |
| Tipo de prueba | Seguridad / Administrador |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar facultad administrativa para desbloquear cuentas de usuario bloqueadas |
| Objetivo | Comprobar restauración de estado activo y reinicio de contador de intentos |
| Precondiciones | Servicio laika_auth activo; credenciales admin |
| Datos de prueba | Ruta: PATCH /api/admin/users/30165/unlock |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Desbloquear cuenta de usuario ID 30165 | HTTP 200 con confirmación | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-045_flujo_auth_desbloqueo_cuenta_admin_patch_evidence.json](evidencias/admin/CP-ADV-045_flujo_auth_desbloqueo_cuenta_admin_patch_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Cuenta desbloqueada exitosamente por administrador |
