## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-024 | Fecha de ejecución | 2026-11-16 16:15:29 |
| Nombre de la prueba | gestor_merchandise_catalog_uat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UAT / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UAT |
| Tipo de prueba | Aceptación / Mercancía |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar catálogo y configuración de mercancía del gestor |
| Objetivo | Verificar consulta de productos y parámetros de venta |
| Precondiciones | Gestor ID 3 |
| Datos de prueba | GET /api/merchandise?manager_id=3 y /api/merchandise/settings/3 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Listar productos de mercancía | HTTP 200 y array | HTTP 200, total=2 | ✓ |
| 2 | Consultar configuración de gestor | HTTP 200 con commissionPercentage | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-024_gestor_merchandise_catalog_uat_evidence.json](evidencias/gestor/CP-GES-024_gestor_merchandise_catalog_uat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
