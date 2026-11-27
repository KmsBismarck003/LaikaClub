## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-040 | Fecha de ejecución | 2026-11-16 16:15:00 |
| Nombre de la prueba | gestor_unauthenticated_request_sec | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | SECURITY / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SECURITY |
| Tipo de prueba | Seguridad / Auth |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar rechazo total de peticiones sin autenticación en rutas de gestor |
| Objetivo | Garantizar respuesta HTTP 401 Unauthorized sin cabecera Bearer |
| Precondiciones | Sin cabecera Authorization |
| Datos de prueba | GET /api/manager/events |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Petición anónima a /api/manager/events | HTTP 401 Unauthorized | HTTP 401 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-040_gestor_unauthenticated_request_sec_evidence.json](evidencias/gestor/CP-GES-040_gestor_unauthenticated_request_sec_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
