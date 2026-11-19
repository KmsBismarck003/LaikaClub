## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-024 | Fecha de ejecución | 2026-11-16 16:15:53 |
| Nombre de la prueba | flujo_auth_password_incorrecta_rechazo_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Seguridad / Login | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SECURITY |
| Tipo de prueba | Seguridad / Autenticación |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar rechazo de inicio de sesión ante contraseña errónea y conteo de intentos |
| Objetivo | Comprobar respuesta HTTP 401 con mensaje de credenciales inválidas |
| Precondiciones | Servicio laika_auth activo |
| Datos de prueba | Email válido, Password erróneo |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar login con contraseña incorrecta | HTTP 401 Unauthorized | HTTP 401 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-024_flujo_auth_password_incorrecta_rechazo_post_evidence.json](evidencias/avanzados/CP-ADV-024_flujo_auth_password_incorrecta_rechazo_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | 401 Unauthorized verificado: {'detail': {'max_attempts': 3, 'message': 'Credenciales inválidas', 'attempts': 1}} |
