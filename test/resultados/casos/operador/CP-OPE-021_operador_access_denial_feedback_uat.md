## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-021 | Fecha de ejecución | 2026-11-16 16:15:29 |
| Nombre de la prueba | operador_access_denial_feedback_uat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UAT / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UAT |
| Tipo de prueba | Aceptación / Rechazo |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar retroalimentación clara en pantalla ante código apócrifo |
| Objetivo | Garantizar mensaje de alerta inmediata para detener acceso no autorizado |
| Precondiciones | Código no registrado |
| Datos de prueba | POST /api/tickets/verify con TKT-FALSO-000 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Comprobar rechazo visual y sonoro | isError=True y statusCode=INVALID_CODE | isError=True, code=INVALID_CODE | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-021_operador_access_denial_feedback_uat_evidence.json](evidencias/operador/CP-OPE-021_operador_access_denial_feedback_uat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
