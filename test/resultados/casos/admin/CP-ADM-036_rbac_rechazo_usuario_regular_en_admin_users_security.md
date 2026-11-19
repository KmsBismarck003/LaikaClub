## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-036 | Fecha de ejecución | 2026-11-16 16:14:59 |
| Nombre de la prueba | rbac_rechazo_usuario_regular_en_admin_users_security | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | SECURITY / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SECURITY |
| Tipo de prueba | Seguridad / Control de Acceso |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar que un usuario con rol regular 'usuario' sea estrictamente RECHAZADO al invocar /api/admin/users |
| Objetivo | Garantizar principio de mínimo privilegio (OWASP Top 10 A01: Broken Access Control) |
| Precondiciones | Token válido de usuario ordinario |
| Datos de prueba | GET /api/admin/users |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Usuario ordinario invoca /api/admin/users | Acceso denegado | HTTP 500 ({"detail":"Access Denied"}) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-036_rbac_rechazo_usuario_regular_en_admin_users_security_evidence.json](evidencias/admin/CP-ADM-036_rbac_rechazo_usuario_regular_en_admin_users_security_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El microservicio rechaza el acceso denegando la petición al no tener rol 'admin' |
