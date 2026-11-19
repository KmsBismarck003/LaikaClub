## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-044 | Fecha de ejecución | 2026-11-16 16:15:47 |
| Nombre de la prueba | flujo_auth_bloqueo_cuenta_intentos_fallidos_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Seguridad / Intentos Fallidos | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SECURITY |
| Tipo de prueba | Seguridad / Brute Force Prevention |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar conteo de intentos fallidos y respuesta ante contraseñas incorrectas |
| Objetivo | Comprobar que el servicio responde HTTP 401 con metadata de intentos y límite máximo |
| Precondiciones | Servicio laika_auth activo |
| Datos de prueba | Ruta: POST /api/auth/login |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar credencial incorrecta | HTTP 401 con detalle de intentos | HTTP 401 (intentos: 1/3) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-044_flujo_auth_bloqueo_cuenta_intentos_fallidos_post_evidence.json](evidencias/avanzados/CP-ADV-044_flujo_auth_bloqueo_cuenta_intentos_fallidos_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Mecanismo de seguridad de intentos fallidos activo: HTTP 401 con max_attempts=3 |
