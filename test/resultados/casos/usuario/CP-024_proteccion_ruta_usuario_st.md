## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-024 | Fecha de ejecución | 2026-11-16 16:15:17 |
| Nombre de la prueba | proteccion_ruta_usuario_st | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Sistema / Guardia de Seguridad | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | ST |
| Tipo de prueba | Seguridad / Sistema |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa el bloqueo de acceso a endpoints protegidos de la cartera, perfil y reembolsos cuando la petición no incluye cabecera de autenticación. |
| Objetivo | Verificar que el sistema rechace con código HTTP 401 (Unauthorized) las solicitudes no autenticadas. |
| Precondiciones | Servicios activos en Docker. |
| Datos de prueba | Endpoints protegidos sin token: /api/auth/users/me, /api/tickets/my-tickets, /api/tickets/refund/my-refunds |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Solicitar Perfil de usuario (http://localhost:8000/api/auth/users/me) sin token | HTTP 401 Unauthorized o 403 Forbidden | HTTP 401 | ✓ |
| 2 | Solicitar Cartera de boletos (http://localhost:8000/api/tickets/my-tickets) sin token | HTTP 401 Unauthorized o 403 Forbidden | HTTP 401 | ✓ |
| 3 | Solicitar Rastreador de reembolsos (http://localhost:8000/api/tickets/refund/my-refunds) sin token | HTTP 401 Unauthorized o 403 Forbidden | HTTP 401 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-024_proteccion_ruta_usuario_st_evidence.json](evidencias/usuario/CP-024_proteccion_ruta_usuario_st_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Las guardias de seguridad impiden el acceso anónimo a recursos privados. |
