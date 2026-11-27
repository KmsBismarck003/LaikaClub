## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-053 | Fecha de ejecución | 2026-11-16 16:13:55 |
| Nombre de la prueba | admin_users_create_endpoint_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Creación |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint POST /api/admin/users para alta de usuarios |
| Objetivo | Garantizar respuesta HTTP 200 con user_id asignado |
| Precondiciones | Admin autenticado |
| Datos de prueba | POST /api/admin/users |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | POST /api/admin/users | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar user_id en respuesta | user_id no nulo | user_id=30177 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-053_admin_users_create_endpoint_post_evidence.json](evidencias/admin/CP-ADM-053_admin_users_create_endpoint_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
