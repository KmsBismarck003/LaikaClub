## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-020 | Fecha de ejecución | 2026-11-16 16:15:16 |
| Nombre de la prueba | admin_restore_audit_severity_filter_st | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | ST / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | ST |
| Tipo de prueba | Funcional / Auditoría |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar filtrado por severidad en auditoría de restauración |
| Objetivo | Verificar que la consulta por severidad 'critical' responde correctamente |
| Precondiciones | Admin autenticado |
| Datos de prueba | GET /api/restore-audit/events?severity=critical |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar eventos de severidad crítica | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar filtro de severidad | Todos con severity=='critical' | Eventos: 0 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-020_admin_restore_audit_severity_filter_st_evidence.json](evidencias/admin/CP-ADM-020_admin_restore_audit_severity_filter_st_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
