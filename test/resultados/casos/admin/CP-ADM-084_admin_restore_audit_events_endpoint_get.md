## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-084 | Fecha de ejecución | 2026-11-16 16:13:54 |
| Nombre de la prueba | admin_restore_audit_events_endpoint_get | Responsable (tester) | QA Automation |
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
| Descripción | Comprobar endpoint GET /api/restore-audit/events |
| Objetivo | Validar respuesta HTTP 200 con listado de eventos de restauración |
| Precondiciones | Admin autenticado |
| Datos de prueba | GET /api/restore-audit/events |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/restore-audit/events | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar lista de eventos | events presente | total=0 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-084_admin_restore_audit_events_endpoint_get_evidence.json](evidencias/admin/CP-ADM-084_admin_restore_audit_events_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
