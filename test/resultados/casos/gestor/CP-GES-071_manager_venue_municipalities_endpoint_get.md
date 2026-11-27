## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-071 | Fecha de ejecución | 2026-11-16 16:14:05 |
| Nombre de la prueba | manager_venue_municipalities_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Ubicaciones |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint GET /api/venues/locations/municipalities/{state_id} |
| Objetivo | Validar consulta de municipios por estado ID 1 |
| Precondiciones | Estado ID 1 |
| Datos de prueba | GET /api/venues/locations/municipalities/1 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/venues/locations/municipalities/1 | HTTP 200 con lista de municipios | HTTP 200, total=11 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-071_manager_venue_municipalities_endpoint_get_evidence.json](evidencias/gestor/CP-GES-071_manager_venue_municipalities_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
