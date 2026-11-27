## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-053 | Fecha de ejecución | 2026-11-16 12:56:57 |
| Nombre de la prueba | mensajes_error_login_usability | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Usabilidad / Retroalimentación de Errores | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | USABILITY |
| Tipo de prueba | Usabilidad |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa que los mensajes de error retornados ante credenciales incorrectas sean comprensibles, amigables y no expongan stacktraces técnicos al usuario. |
| Objetivo | Garantizar una retroalimentación clara que informe al usuario del problema sin comprometer detalles internos del sistema. |
| Precondiciones | Servicio de autenticación en línea. |
| Datos de prueba | Login con contraseña incorrecta |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Provocar error controlado de credenciales inválidas | HTTP 401 Unauthorized | HTTP 401 | ✓ |
| 2 | Validar redacción del mensaje de error | Mensaje claro en español sobre credenciales no válidas | Mensaje obtenido: 'Credenciales inválidas' | ✓ |
| 3 | Verificar ausencia de stacktraces o tecnicismos en el cuerpo de error | Cero excepciones técnicas expuestas | Tecnicismos filtrados: Ninguno (Limpio) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-053_mensajes_error_login_usability_evidence.json](evidencias/CP-053_mensajes_error_login_usability_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | La interfaz provee mensajes sobrios y profesionales orientados al usuario final. |
