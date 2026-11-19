## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-040 | Fecha de ejecución | 2026-11-16 16:15:31 |
| Nombre de la prueba | operador_invalid_code_feedback_us | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | USABILITY / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | USABILITY |
| Tipo de prueba | Usabilidad / Mensajería |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evaluar claridad del mensaje cuando el código no existe en el sistema |
| Objetivo | Garantizar que se notifique 'CÓDIGO INEXISTENTE' al operador |
| Precondiciones | Código TKT-UNKNOWN-XYZ |
| Datos de prueba | POST /api/tickets/verify |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Validar feedback por código inexistente | INVALID_CODE con título claro | title='CÓDIGO INEXISTENTE' | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-040_operador_invalid_code_feedback_us_evidence.json](evidencias/operador/CP-OPE-040_operador_invalid_code_feedback_us_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
