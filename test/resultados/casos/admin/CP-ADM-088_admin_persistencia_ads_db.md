## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-088 | Fecha de ejecución | 2026-11-16 16:14:16 |
| Nombre de la prueba | admin_persistencia_ads_db | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | DATABASE / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | DATABASE |
| Tipo de prueba | Integridad Relacional |
| Técnica | Caja gris |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar integridad de tabla ads y ad_clicks en la base laika_admin |
| Objetivo | Garantizar que las llaves foráneas o referencias de ID se mantengan consistentes |
| Precondiciones | MySQL 8.0 tabla laika_admin.ads |
| Datos de prueba | Auditoría de consistencia de anuncios |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar tablas ads y ad_clicks | Conexión y tablas operativas | ads=3, clicks=5 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-088_admin_persistencia_ads_db_evidence.json](evidencias/admin/CP-ADM-088_admin_persistencia_ads_db_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
