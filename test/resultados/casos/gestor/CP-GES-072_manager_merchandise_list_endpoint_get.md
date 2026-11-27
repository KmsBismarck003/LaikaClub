## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-072 | Fecha de ejecución | 2026-11-16 16:14:05 |
| Nombre de la prueba | manager_merchandise_list_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Mercancía |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint GET /api/merchandise con filtro manager_id=3 |
| Objetivo | Validar que el gestor consulte exclusivamente sus productos de mercancía |
| Precondiciones | Gestor ID 3 |
| Datos de prueba | GET /api/merchandise?manager_id=3 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/merchandise?manager_id=3 | HTTP 200 con productos de manager 3 | HTTP 200, total=2 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-072_manager_merchandise_list_endpoint_get_evidence.json](evidencias/gestor/CP-GES-072_manager_merchandise_list_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
