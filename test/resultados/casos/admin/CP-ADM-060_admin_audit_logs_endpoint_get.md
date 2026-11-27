## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-060 | Fecha de ejecución | 2026-11-16 16:13:52 |
| Nombre de la prueba | admin_audit_logs_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Auditoría |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint GET /api/auth/audit |
| Objetivo | Garantizar consulta de logs de autenticación y accesos del sistema |
| Precondiciones | Admin autenticado |
| Datos de prueba | GET /api/auth/audit |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/auth/audit | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar lista de logs | Lista JSON devuelta | Elementos: 5 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-060_admin_audit_logs_endpoint_get_evidence.json](evidencias/admin/CP-ADM-060_admin_audit_logs_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
