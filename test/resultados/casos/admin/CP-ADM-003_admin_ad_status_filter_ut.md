## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-003 | Fecha de ejecución | 2026-11-16 16:15:32 |
| Nombre de la prueba | admin_ad_status_filter_ut | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UT / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UT |
| Tipo de prueba | Lógica / Filtrado |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar filtrado de anuncios públicos visibles |
| Objetivo | Comprobar descarte de anuncios inactivos o eventos deshabilitados |
| Precondiciones | Lista de anuncios con varios estados |
| Datos de prueba | active, event.status, ads_enabled |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Filtrar anuncios | IDs [1, 3] | IDs [1, 3] | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-003_admin_ad_status_filter_ut_evidence.json](evidencias/admin/CP-ADM-003_admin_ad_status_filter_ut_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
