## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-065 | Fecha de ejecución | 2026-11-16 16:13:53 |
| Nombre de la prueba | admin_database_export_svg_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Diagrama ER |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint GET /api/database/export/svg |
| Objetivo | Garantizar generación del diagrama entidad-relación en formato SVG vectorial |
| Precondiciones | Admin autenticado |
| Datos de prueba | GET /api/database/export/svg |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/database/export/svg | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar tag vectorial SVG | <svg presente en el cuerpo | has_svg=True | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-065_admin_database_export_svg_endpoint_get_evidence.json](evidencias/admin/CP-ADM-065_admin_database_export_svg_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
