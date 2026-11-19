## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-039 | Fecha de ejecución | 2026-11-16 16:15:31 |
| Nombre de la prueba | operador_future_event_feedback_us | Responsable (tester) | QA Automation |
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
| Descripción | Evaluar claridad del mensaje cuando un boleto corresponde a un evento futuro |
| Objetivo | Garantizar explicación comprensible para el operador y el asistente |
| Precondiciones | Boleto TKT-C853F390 |
| Datos de prueba | POST /api/tickets/verify |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Validar feedback por evento próximo | FUTURE_EVENT con mensaje explicativo | msg='El evento aún no abre puertas de ingreso. Apertura programad...' | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-039_operador_future_event_feedback_us_evidence.json](evidencias/operador/CP-OPE-039_operador_future_event_feedback_us_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
