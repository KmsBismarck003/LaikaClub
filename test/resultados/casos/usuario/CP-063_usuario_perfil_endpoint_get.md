## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-063 | Fecha de ejecución | 2026-11-16 16:14:14 |
| Nombre de la prueba | usuario_perfil_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Perfil de Usuario | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa la obtención del perfil propio del usuario autenticado mediante GET /api/auth/users/me. |
| Objetivo | Verificar que el servicio retorne HTTP 200 con el DTO UserProfileResponse conteniendo los datos de la cuenta activa. |
| Precondiciones | Token JWT Bearer válido. |
| Datos de prueba | Token JWT del usuario de prueba |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar GET /api/auth/users/me con Bearer token | HTTP 200 OK | HTTP 200 | ✓ |
| 2 | Validar coincidencia de email y rol en el DTO | Email=qa_user_test@laikaclub.com, Rol=usuario | Email=qa_user_test@laikaclub.com, Rol=usuario | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-063_usuario_perfil_endpoint_get_evidence.json](evidencias/usuario/CP-063_usuario_perfil_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El endpoint retorna con fidelidad los datos asociados al token de sesión. |
