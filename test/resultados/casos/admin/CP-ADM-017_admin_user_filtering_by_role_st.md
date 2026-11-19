## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-017 | Fecha de ejecución | 2026-11-16 16:15:16 |
| Nombre de la prueba | admin_user_filtering_by_role_st | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | ST / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | ST |
| Tipo de prueba | Funcional / Filtros |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar filtrado de usuarios por rol en la consola de administración |
| Objetivo | Garantizar que al filtrar por role=gestor solo se retornen gestores |
| Precondiciones | Admin autenticado |
| Datos de prueba | GET /api/admin/users?role=gestor |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar usuarios con role=gestor | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar rol de los usuarios devueltos | Todos con role=='gestor' | Total evaluados: 10, all_gestores=True | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-017_admin_user_filtering_by_role_st_evidence.json](evidencias/admin/CP-ADM-017_admin_user_filtering_by_role_st_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
