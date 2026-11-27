## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-046 | Fecha de ejecución | 2026-11-16 16:14:26 |
| Nombre de la prueba | exploratorio_ids_inexistentes_en_usuarios_et | Responsable (tester) | QA Automation |
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
| Descripción | Exploración de operaciones sobre usuarios inexistentes (ID: 99999999) |
| Objetivo | Comprobar respuesta adecuada ante intentos de cambio de estado o borrado de ID inexistente |
| Precondiciones | Admin autenticado |
| Datos de prueba | PATCH /api/admin/users/99999999/status |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Modificar estado de ID inexistente | Respuesta controlada | HTTP 500 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-046_exploratorio_ids_inexistentes_en_usuarios_et_evidence.json](evidencias/admin/CP-ADM-046_exploratorio_ids_inexistentes_en_usuarios_et_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
