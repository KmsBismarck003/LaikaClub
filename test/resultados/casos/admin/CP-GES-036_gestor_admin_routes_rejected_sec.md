## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-036 | Fecha de ejecución | 2026-11-16 16:15:00 |
| Nombre de la prueba | gestor_admin_routes_rejected_sec | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | SECURITY / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SECURITY |
| Tipo de prueba | Seguridad / RBAC |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar que gestor no tenga acceso a tablas administrativas |
| Objetivo | Garantizar respuesta HTTP 403 Forbidden en /api/database/tables |
| Precondiciones | Token con rol gestor |
| Datos de prueba | GET /api/database/tables |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Acceso a tablas administrativas | HTTP 403 Forbidden | HTTP 403 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-036_gestor_admin_routes_rejected_sec_evidence.json](evidencias/admin/CP-GES-036_gestor_admin_routes_rejected_sec_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
