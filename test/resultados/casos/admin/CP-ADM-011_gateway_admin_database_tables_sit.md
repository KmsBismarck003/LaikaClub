## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-011 | Fecha de ejecución | 2026-11-16 16:15:01 |
| Nombre de la prueba | gateway_admin_database_tables_sit | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | SIT / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SIT |
| Tipo de prueba | Integración de Sistema |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar integración Gateway -> Admin Service para /api/database/tables |
| Objetivo | Garantizar que el gateway despacha la consulta hacia el microservicio admin |
| Precondiciones | Admin autenticado |
| Datos de prueba | GET /api/database/tables |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/database/tables a través de Gateway | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar lista de tablas | tables list no vacía | Tablas: 10 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-011_gateway_admin_database_tables_sit_evidence.json](evidencias/admin/CP-ADM-011_gateway_admin_database_tables_sit_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
