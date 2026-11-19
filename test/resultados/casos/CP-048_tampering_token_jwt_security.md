## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-048 | Fecha de ejecución | 2026-11-16 12:56:47 |
| Nombre de la prueba | tampering_token_jwt_security | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Seguridad / Integridad de Tokens JWT | Ambiente | QA / Docker Live Services |
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
| Descripción | Evalúa la resistencia criptográfica ante intentos de alteración de tokens JWT (modificación de caracteres en la firma o intento de escalada de privilegios en el payload). |
| Objetivo | Verificar que cualquier token manipulado sea rechazado inmediatamente con código HTTP 401 Unauthorized. |
| Precondiciones | Servicio de autenticación en línea. |
| Datos de prueba | Token original alterado en su último byte |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar petición con token JWT adulterado (firma corrupta) | HTTP 401 Unauthorized | HTTP 401 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-048_tampering_token_jwt_security_evidence.json](evidencias/CP-048_tampering_token_jwt_security_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | La verificación criptográfica HMAC-SHA256 detecta y bloquea tokens manipulados. |
