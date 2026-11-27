## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-049 | Fecha de ejecución | 2026-11-16 16:14:04 |
| Nombre de la prueba | manager_events_create_endpoint_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Eventos |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint POST /api/manager/events |
| Objetivo | Validar creación correcta de un nuevo evento por el gestor |
| Precondiciones | Gestor autenticado |
| Datos de prueba | POST /api/manager/events |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | POST /api/manager/events | HTTP 200/201 con ID generado | HTTP 200, ID=100031 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-049_manager_events_create_endpoint_post_evidence.json](evidencias/gestor/CP-GES-049_manager_events_create_endpoint_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
