## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-023 | Fecha de ejecución | 2026-11-16 16:15:28 |
| Nombre de la prueba | gestor_courtesy_audit_uat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UAT / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UAT |
| Tipo de prueba | Aceptación / Cortesías |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar panel de auditoría de cortesías para evento |
| Objetivo | Garantizar disponibilidad de cuotas restantes y boletos emitidos |
| Precondiciones | Evento 100001 |
| Datos de prueba | GET /api/tickets/courtesy/event/100001 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Inspección de panel de cortesías | HTTP 200 con cuotas | HTTP 200, allowed=25 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-023_gestor_courtesy_audit_uat_evidence.json](evidencias/gestor/CP-GES-023_gestor_courtesy_audit_uat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
