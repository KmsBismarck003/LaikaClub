## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-051 | Fecha de ejecución | 2026-11-16 16:13:55 |
| Nombre de la prueba | admin_users_filter_status_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Filtros |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar parámetro ?status=active en GET /api/admin/users |
| Objetivo | Validar que solo se retornen usuarios con estado 'active' |
| Precondiciones | Admin autenticado |
| Datos de prueba | GET /api/admin/users?status=active |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/admin/users?status=active | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar status devueltos | Todos 'active' | Total: 5, match=True | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-051_admin_users_filter_status_endpoint_get_evidence.json](evidencias/admin/CP-ADM-051_admin_users_filter_status_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
