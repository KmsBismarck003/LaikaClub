## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-045 | Fecha de ejecución | 2026-11-16 16:14:26 |
| Nombre de la prueba | exploratorio_paginacion_limites_extremos_et | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | ET / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | ET |
| Tipo de prueba | Exploratorio / Casos Límite |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Exploración de valores extremos en paginación de usuarios (page=999999, limit=0) |
| Objetivo | Garantizar que no se produzcan caídas de servidor ni excepciones no controladas |
| Precondiciones | Admin autenticado |
| Datos de prueba | GET /api/admin/users?page=999999&limit=0 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Solicitar página 999999 con limit=0 | HTTP 200 o 400 manejado | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-045_exploratorio_paginacion_limites_extremos_et_evidence.json](evidencias/admin/CP-ADM-045_exploratorio_paginacion_limites_extremos_et_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
