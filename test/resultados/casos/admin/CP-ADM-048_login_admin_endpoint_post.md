## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-048 | Fecha de ejecución | 2026-11-16 16:13:56 |
| Nombre de la prueba | login_admin_endpoint_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Autenticación |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint POST /api/auth/login para credenciales de Administrador |
| Objetivo | Validar respuesta HTTP 200 y emisión de token JWT con rol admin |
| Precondiciones | Credenciales maestras de prueba |
| Datos de prueba | POST /api/auth/login |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | POST /api/auth/login | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar rol y token | token y role=='admin' | role=admin | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-048_login_admin_endpoint_post_evidence.json](evidencias/admin/CP-ADM-048_login_admin_endpoint_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
