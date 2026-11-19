## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-043 | Fecha de ejecución | 2026-11-16 16:15:31 |
| Nombre de la prueba | gestor_invalid_courtesy_token_feedback_us | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | USABILITY / Gestor | Ambiente | QA / Docker Live Services |
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
| Descripción | Evaluar claridad del mensaje ante token de cortesía inexistente |
| Objetivo | Garantizar respuesta explicativa HTTP 404 al intentar validar token inválido |
| Precondiciones | Token ficticio |
| Datos de prueba | GET /api/tickets/courtesy/validate-token/CODIGO-INEXISTENTE-999 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Validar feedback por token inexistente | HTTP 404 con mensaje claro | HTTP 404, msg='Código de cortesía no encontrado' | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-043_gestor_invalid_courtesy_token_feedback_us_evidence.json](evidencias/gestor/CP-GES-043_gestor_invalid_courtesy_token_feedback_us_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
