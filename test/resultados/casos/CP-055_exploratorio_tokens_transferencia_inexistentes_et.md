## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-055 | Fecha de ejecución | 2026-11-16 12:56:33 |
| Nombre de la prueba | exploratorio_tokens_transferencia_inexistentes_et | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Exploratorio / Centro de Canje de Transferencias | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | ET |
| Tipo de prueba | Exploratorio |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Explora cómo reacciona el sistema cuando un usuario intenta reclamar o consultar un token de transferencia aleatorio nunca generado. |
| Objetivo | Verificar que el sistema rechace limpiamente tokens espurios (400 o 404) sin lanzar excepciones no controladas ni colapsar el servicio. |
| Precondiciones | Servicio de tickets en ejecución. |
| Datos de prueba | Token GUID aleatorio generado con uuid4 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Validar token aleatorio inexistente 'e002c41d52ea4402b7a535544b0d6c4b' | Token catalogado como no válido o no encontrado | HTTP 404, Valid: None | ✓ |
| 2 | Intentar canjear el token falso con POST /api/tickets/courtesy/claim | Petición rechazada con HTTP 400/404 sin crear registros de ticket | HTTP 404 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-055_exploratorio_tokens_transferencia_inexistentes_et_evidence.json](evidencias/CP-055_exploratorio_tokens_transferencia_inexistentes_et_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El servicio maneja adecuadamente tokens erróneos o manipulados con código de error controlado. |
