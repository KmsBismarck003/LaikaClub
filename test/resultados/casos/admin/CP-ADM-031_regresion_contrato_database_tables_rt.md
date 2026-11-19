## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-031 | Fecha de ejecución | 2026-11-16 16:14:50 |
| Nombre de la prueba | regresion_contrato_database_tables_rt | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | RT / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | RT |
| Tipo de prueba | Regresión / Contratos |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar invariancia de contrato en /api/database/tables |
| Objetivo | Garantizar que la respuesta contenga el arreglo 'tables' con objetos de tipo {name, row_count} |
| Precondiciones | Admin autenticado |
| Datos de prueba | GET /api/database/tables |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Solicitar catálogo de tablas | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar estructura de items | name y row_count presentes | has_tables=True, item_ok=True | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-031_regresion_contrato_database_tables_rt_evidence.json](evidencias/admin/CP-ADM-031_regresion_contrato_database_tables_rt_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
