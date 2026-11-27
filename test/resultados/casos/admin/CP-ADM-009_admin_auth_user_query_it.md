## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-009 | Fecha de ejecución | 2026-11-16 16:14:27 |
| Nombre de la prueba | admin_auth_user_query_it | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | IT / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | IT |
| Tipo de prueba | Integración Repositorio |
| Técnica | Caja gris |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Consultar cuenta de administrador activa en la base laika_auth |
| Objetivo | Garantizar que existe al menos un usuario con rol 'admin' y status 'active' |
| Precondiciones | Tabla laika_auth.users |
| Datos de prueba | role = 'admin' |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Verificar existencia de cuenta admin | Count >= 1 | Encontrados: 1 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-009_admin_auth_user_query_it_evidence.json](evidencias/admin/CP-ADM-009_admin_auth_user_query_it_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
