## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-044 | Fecha de ejecución | 2026-11-16 16:15:31 |
| Nombre de la prueba | gestor_create_event_validation_feedback_us | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | USABILITY / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | USABILITY |
| Tipo de prueba | Usabilidad / Formularios |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evaluar respuesta del sistema ante creación de evento sin datos obligatorios |
| Objetivo | Comprobar que el backend rechace la solicitud con error estructurado |
| Precondiciones | Payload vacío |
| Datos de prueba | POST /api/manager/events con {} |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar payload vacío para alta de evento | Rechazo estructurado | HTTP 500 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-044_gestor_create_event_validation_feedback_us_evidence.json](evidencias/gestor/CP-GES-044_gestor_create_event_validation_feedback_us_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
