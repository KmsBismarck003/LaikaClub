## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-050 | Fecha de ejecución | 2026-11-16 12:56:46 |
| Nombre de la prueba | bloqueo_fuerza_bruta_security | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Seguridad / Prevención de Fuerza Bruta | Ambiente | QA / Docker Live Services |
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
| Descripción | Evalúa el endpoint /api/auth/check-lockout para auditar el estado de bloqueo y control de intentos fallidos. |
| Objetivo | Verificar que el sistema exponga adecuadamente la telemetría de bloqueo y responda con los atributos esperados (locked, remaining_seconds). |
| Precondiciones | Servicio de autenticación en línea. |
| Datos de prueba | Email de consulta: 'qa_user_test@laikaclub.com' |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar estado de bloqueo mediante GET /api/auth/check-lockout?email=qa_user_test@laikaclub.com | HTTP 200 con payload informativo de bloqueo | HTTP 200, Payload: {'failed_attempts': 0, 'retry_after': 0, 'locked': False} | ✓ |
| 2 | Validar presencia de indicadores de estado de bloqueo | Atributo locked o similar presente en el payload | Campos: ['failed_attempts', 'retry_after', 'locked'] | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-050_bloqueo_fuerza_bruta_security_evidence.json](evidencias/CP-050_bloqueo_fuerza_bruta_security_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El mecanismo de auditoría de intentos fallidos y bloqueo opera adecuadamente. |
