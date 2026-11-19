## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-050 | Fecha de ejecución | 2026-11-16 16:15:53 |
| Nombre de la prueba | flujo_database_export_formatos_json_svg_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Base de Datos / Exportaciones | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Auditoría |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar exportación del esquema y datos relacionales en formatos JSON y diagrama SVG |
| Objetivo | Comprobar disponibilidad de exportaciones estructurales para documentación y auditoría |
| Precondiciones | Servicio laika_admin activo; credenciales admin |
| Datos de prueba | Ruta: GET /api/database/export/json y /api/database/export/svg |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Exportar esquema en JSON | HTTP 200 con payload JSON | HTTP 200 | ✓ |
| 2 | Exportar diagrama en SVG | HTTP 200 con gráfico vectorial | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-050_flujo_database_export_formatos_json_svg_get_evidence.json](evidencias/avanzados/CP-ADV-050_flujo_database_export_formatos_json_svg_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Exportaciones JSON y SVG validadas exitosamente |
