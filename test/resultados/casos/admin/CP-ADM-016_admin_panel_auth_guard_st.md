## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-016 | Fecha de ejecución | 2026-11-16 16:15:16 |
| Nombre de la prueba | admin_panel_auth_guard_st | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | ST / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | ST |
| Tipo de prueba | Seguridad / Guardias |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Verificar guardia de autenticación en endpoints de administración |
| Objetivo | Garantizar rechazo inmediato de peticiones anónimas sin cabecera Authorization |
| Precondiciones | Petición HTTP sin credenciales |
| Datos de prueba | GET /api/admin/users |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET anónimo a /api/admin/users | HTTP 401/403/Access Denied | HTTP 401 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-016_admin_panel_auth_guard_st_evidence.json](evidencias/admin/CP-ADM-016_admin_panel_auth_guard_st_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
