## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-002 | Fecha de ejecución | 2026-11-16 16:15:34 |
| Nombre de la prueba | operador_status_code_evaluator_ut | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UT / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UT |
| Tipo de prueba | Lógica / Estados |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar evaluación de códigos de estado de acceso para el operador |
| Objetivo | Garantizar que solo VALID_ACCESS otorgue acceso accionable |
| Precondiciones | Códigos de respuesta del validador contextual |
| Datos de prueba | VALID_ACCESS vs ALREADY_REDEEMED |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Evaluar VALID_ACCESS | actionable=True, valid=True | {'actionable': True, 'valid': True} | ✓ |
| 2 | Evaluar ALREADY_REDEEMED | actionable=False, valid=False | {'actionable': False, 'valid': False} | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-002_operador_status_code_evaluator_ut_evidence.json](evidencias/operador/CP-OPE-002_operador_status_code_evaluator_ut_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
