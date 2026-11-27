## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-034 | Fecha de ejecución | 2026-11-16 16:14:37 |
| Nombre de la prueba | latencia_database_tables_stats_pt | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | PT / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | PT |
| Tipo de prueba | Rendimiento / Latencia |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Medir latencia de inspección de tablas y estadísticas de base de datos |
| Objetivo | Garantizar que el análisis de tablas físicas responda en menos de 1000ms |
| Precondiciones | MySQL 8.0 live connection |
| Datos de prueba | GET /api/database/tables |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Medir latencia inspección DB | < 1000ms | 56.11 ms (HTTP 200) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-034_latencia_database_tables_stats_pt_evidence.json](evidencias/admin/CP-ADM-034_latencia_database_tables_stats_pt_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
