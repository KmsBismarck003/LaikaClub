## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-004 | Fecha de ejecución | 2026-11-16 16:15:33 |
| Nombre de la prueba | gestor_event_status_transition_ut | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UT / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UT |
| Tipo de prueba | Lógica / Máquina de estados |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar máquina de estados de eventos para gestor |
| Objetivo | Garantizar transiciones válidas e invalidar saltos ilegales |
| Precondiciones | Estados: draft, published, cancelled, deleted |
| Datos de prueba | draft -> published vs deleted -> published |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Transición draft -> published | True | True | ✓ |
| 2 | Transición published -> draft (unpublish) | True | True | ✓ |
| 3 | Transición ilegal deleted -> published | False | False | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-004_gestor_event_status_transition_ut_evidence.json](evidencias/gestor/CP-GES-004_gestor_event_status_transition_ut_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
