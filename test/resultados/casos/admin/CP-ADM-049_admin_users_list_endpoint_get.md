## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-049 | Fecha de ejecución | 2026-11-16 16:13:55 |
| Nombre de la prueba | admin_users_list_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Directorio |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint GET /api/admin/users |
| Objetivo | Garantizar respuesta HTTP 200 y listado de usuarios del sistema |
| Precondiciones | Admin autenticado |
| Datos de prueba | GET /api/admin/users |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/admin/users | HTTP 200 | HTTP 200 | ✓ |
| 2 | Validar lista de usuarios | users list válida | Total: 30060 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-049_admin_users_list_endpoint_get_evidence.json](evidencias/admin/CP-ADM-049_admin_users_list_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
