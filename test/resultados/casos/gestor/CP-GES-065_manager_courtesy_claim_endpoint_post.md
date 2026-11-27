## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-065 | Fecha de ejecución | 2026-11-16 16:14:03 |
| Nombre de la prueba | manager_courtesy_claim_endpoint_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Cortesías |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint POST /api/tickets/courtesy/claim |
| Objetivo | Validar manejo de canje de cortesía con token inválido |
| Precondiciones | Token inválido |
| Datos de prueba | POST /api/tickets/courtesy/claim |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Canjear token inválido | Rechazo controlado (HTTP 400 o 404) | HTTP 404 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-065_manager_courtesy_claim_endpoint_post_evidence.json](evidencias/gestor/CP-GES-065_manager_courtesy_claim_endpoint_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
