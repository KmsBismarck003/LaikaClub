## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-019 | Fecha de ejecución | 2026-11-16 16:15:15 |
| Nombre de la prueba | admin_database_tables_count_st | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | ST / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | ST |
| Tipo de prueba | Funcional / Integridad |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar conteo y estructura de tablas del sistema de base de datos |
| Objetivo | Garantizar que la consola de base de datos reporte al menos 5 tablas operativas con filas válidas |
| Precondiciones | Admin autenticado |
| Datos de prueba | GET /api/database/tables |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/database/tables | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar tablas y conteos | Tablas >= 5 y conteos válidos | Tablas: 10, rows_valid=True | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-019_admin_database_tables_count_st_evidence.json](evidencias/admin/CP-ADM-019_admin_database_tables_count_st_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
