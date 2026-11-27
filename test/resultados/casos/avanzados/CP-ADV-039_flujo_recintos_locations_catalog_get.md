## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-039 | Fecha de ejecución | 2026-11-16 16:15:52 |
| Nombre de la prueba | flujo_recintos_locations_catalog_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Recintos / Geografía | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Catálogos Geográficos |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar consulta de catálogo geográfico oficial (países, estados y municipios) |
| Objetivo | Comprobar disponibilidad de ubicaciones para asignación territorial de recintos |
| Precondiciones | Servicio laika_events activo |
| Datos de prueba | Ruta: GET /api/venues/locations/countries y states/1 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar catálogo de países | HTTP 200 con listado | HTTP 200 (1 países) | ✓ |
| 2 | Consultar estados por país | HTTP 200 con estados | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-039_flujo_recintos_locations_catalog_get_evidence.json](evidencias/avanzados/CP-ADV-039_flujo_recintos_locations_catalog_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Catálogos territoriales consultados con éxito |
