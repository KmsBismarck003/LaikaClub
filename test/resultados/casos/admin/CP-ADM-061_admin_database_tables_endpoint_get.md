## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-061 | Fecha de ejecución | 2026-11-16 16:13:54 |
| Nombre de la prueba | admin_database_tables_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Base de Datos |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint GET /api/database/tables |
| Objetivo | Validar respuesta HTTP 200 y catálogo de tablas físicas |
| Precondiciones | Admin autenticado |
| Datos de prueba | GET /api/database/tables |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/database/tables | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar lista de tablas | tables no vacía | Tablas: 10 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-061_admin_database_tables_endpoint_get_evidence.json](evidencias/admin/CP-ADM-061_admin_database_tables_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
