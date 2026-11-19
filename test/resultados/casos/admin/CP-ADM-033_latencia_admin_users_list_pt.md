## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-033 | Fecha de ejecución | 2026-11-16 16:14:37 |
| Nombre de la prueba | latencia_admin_users_list_pt | Responsable (tester) | QA Automation |
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
| Descripción | Medir tiempo de respuesta de consulta de usuarios en consola admin |
| Objetivo | Garantizar que la consulta con paginación responda en menos de 1500ms |
| Precondiciones | Base de datos con más de 30,000 registros |
| Datos de prueba | GET /api/admin/users?limit=20 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Medir latencia HTTP | < 1500ms | 31.07 ms (HTTP 200) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-033_latencia_admin_users_list_pt_evidence.json](evidencias/admin/CP-ADM-033_latencia_admin_users_list_pt_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
