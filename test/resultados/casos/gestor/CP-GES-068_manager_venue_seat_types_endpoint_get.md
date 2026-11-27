## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-068 | Fecha de ejecución | 2026-11-16 16:14:05 |
| Nombre de la prueba | manager_venue_seat_types_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Asientos |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint GET /api/venues/seat-types |
| Objetivo | Validar consulta de catálogo de tipos de asiento (VIP, General, etc.) |
| Precondiciones | Catálogo de asientos |
| Datos de prueba | GET /api/venues/seat-types |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/venues/seat-types | HTTP 200 con tipos de asiento | HTTP 200, total=8 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-068_manager_venue_seat_types_endpoint_get_evidence.json](evidencias/gestor/CP-GES-068_manager_venue_seat_types_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
