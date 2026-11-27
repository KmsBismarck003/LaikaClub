## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-067 | Fecha de ejecución | 2026-11-16 16:14:05 |
| Nombre de la prueba | manager_venue_detail_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Recintos |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint GET /api/venues/{id} |
| Objetivo | Validar consulta de información detallada de recinto ID 12 |
| Precondiciones | Recinto ID 12 |
| Datos de prueba | GET /api/venues/12 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/venues/12 | HTTP 200 con id 12 | HTTP 405, name='None' | ✗ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Fallida |
| Evidencias | [CP-GES-067_manager_venue_detail_endpoint_get_evidence.json](evidencias/gestor/CP-GES-067_manager_venue_detail_endpoint_get_evidence.json) |
| Defecto reportado | DEF-GES-004 |
| Severidad del defecto | Media |
| Observaciones | Falta endpoint GET /venues/{id} en VenueController: responde HTTP 405 Method Not Allowed |
