## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-010 | Fecha de ejecución | 2026-11-16 16:15:01 |
| Nombre de la prueba | gateway_admin_users_sit | Responsable (tester) | QA Automation |
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
| Descripción | Comprobar integración Gateway -> Auth para /api/admin/users |
| Objetivo | Garantizar que el gateway reenvía la consulta con cabecera Bearer y responde usuarios |
| Precondiciones | Admin autenticado con token válido |
| Datos de prueba | GET /api/admin/users?limit=5 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/admin/users a través de Gateway | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar estructura JSON de respuesta | Keys total y users presentes | Total: 30062 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-010_gateway_admin_users_sit_evidence.json](evidencias/admin/CP-ADM-010_gateway_admin_users_sit_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
