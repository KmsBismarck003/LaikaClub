## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-060 | Fecha de ejecución | 2026-11-16 12:56:27 |
| Nombre de la prueba | login_correo_vacio_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Autenticación | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Validación / Negativo |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa el rechazo de peticiones de login que envían el correo vacío o nulo. |
| Objetivo | Garantizar que el servicio valide la presencia obligatoria del correo retornando HTTP 400 o 422. |
| Precondiciones | Servicio de autenticación en línea. |
| Datos de prueba | email: '', password: 'SomePassword123!' |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar POST /api/auth/login con email vacío | HTTP 400 Bad Request o 422 Unprocessable Entity | HTTP 422 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-060_login_correo_vacio_post_evidence.json](evidencias/CP-060_login_correo_vacio_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El servicio rechaza la solicitud antes de intentar verificar el hash. |
