## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-049 | Fecha de ejecución | 2026-11-16 12:56:46 |
| Nombre de la prueba | control_acceso_rbac_usuario_security | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Seguridad / Control de Acceso Basado en Roles (RBAC) | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SECURITY |
| Tipo de prueba | Seguridad |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa el confinamiento de privilegios para el rol 'usuario' intentando acceder a endpoints restringidos de 'admin' y 'gestor'. |
| Objetivo | Garantizar que solicitudes autorizadas como rol 'usuario' sean rechazadas con HTTP 403 Forbidden al intentar invocar rutas administrativas. |
| Precondiciones | Usuario autenticado con rol usuario legítimo. |
| Datos de prueba | Endpoints: /api/admin/users, /api/events/manager/transactions |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Intentar acceso no autorizado a Lista de usuarios del Administrador (http://localhost:8000/api/admin/users) | HTTP 403 Forbidden o 401 Unauthorized | HTTP 500 (VULNERABILIDAD - Acceso Permitido) | ✗ |
| 2 | Intentar acceso no autorizado a Transacciones financieras del Gestor (http://localhost:8000/api/events/manager/transactions) | HTTP 403 Forbidden o 401 Unauthorized | HTTP 200 (VULNERABILIDAD - Acceso Permitido) | ✗ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Fallida |
| Evidencias | [CP-049_control_acceso_rbac_usuario_security_evidence.json](evidencias/CP-049_control_acceso_rbac_usuario_security_evidence.json) |
| Defecto reportado | DEF-003 |
| Severidad del defecto | Crítica |
| Observaciones | Falla de control de acceso (OWASP Top 10 A01: Broken Access Control). El endpoint GET /manager/transactions en EventController.java omite validar que el rol del usuario sea 'gestor' o 'admin', permitiendo a cualquier usuario con rol 'usuario' consultar métricas financieras y transacciones del recinto. |
