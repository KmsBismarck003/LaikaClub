## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-013 | Fecha de ejecución | 2026-11-16 16:15:01 |
| Nombre de la prueba | gestor_gateway_courtesy_quotas_sit | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | SIT / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SIT |
| Tipo de prueba | Integración de Sistema |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar comunicación Gateway -> Tickets Service (/api/tickets/courtesy/my-quotas) |
| Objetivo | Verificar consulta de cuotas de cortesía para el gestor autenticado |
| Precondiciones | Tickets Service activo |
| Datos de prueba | GET /api/tickets/courtesy/my-quotas |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar cuotas de cortesías | HTTP 200 con lista JSON | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-013_gestor_gateway_courtesy_quotas_sit_evidence.json](evidencias/gestor/CP-GES-013_gestor_gateway_courtesy_quotas_sit_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
