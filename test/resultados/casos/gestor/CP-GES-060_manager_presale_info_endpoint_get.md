## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-060 | Fecha de ejecución | 2026-11-16 16:14:05 |
| Nombre de la prueba | manager_presale_info_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Preventa |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint GET /api/presale/{event_id}/info |
| Objetivo | Validar consulta pública de información y estado de preventa para un evento |
| Precondiciones | Evento ID 100001 |
| Datos de prueba | GET /api/presale/100001/info |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/presale/100001/info | HTTP 200 con presale_enabled | HTTP 404, enabled=None | ✗ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Fallida |
| Evidencias | [CP-GES-060_manager_presale_info_endpoint_get_evidence.json](evidencias/gestor/CP-GES-060_manager_presale_info_endpoint_get_evidence.json) |
| Defecto reportado | DEF-GES-003 |
| Severidad del defecto | Alta |
| Observaciones | Falta ruta de API Gateway: /api/presale/** no está enrutado hacia microservicio Events |
