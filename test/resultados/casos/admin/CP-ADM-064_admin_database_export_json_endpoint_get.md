## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-064 | Fecha de ejecución | 2026-11-16 16:13:53 |
| Nombre de la prueba | admin_database_export_json_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Exportación |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint GET /api/database/export/json |
| Objetivo | Garantizar descarga del esquema relacional en formato JSON |
| Precondiciones | Admin autenticado |
| Datos de prueba | GET /api/database/export/json |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/database/export/json | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar payload exportado | Content-Type JSON y bytes > 0 | Bytes: 23924 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-064_admin_database_export_json_endpoint_get_evidence.json](evidencias/admin/CP-ADM-064_admin_database_export_json_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
