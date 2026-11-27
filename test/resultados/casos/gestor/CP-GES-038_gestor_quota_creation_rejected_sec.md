## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-038 | Fecha de ejecución | 2026-11-16 16:15:00 |
| Nombre de la prueba | gestor_quota_creation_rejected_sec | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | SECURITY / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SECURITY |
| Tipo de prueba | Seguridad / RBAC |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar que gestor no pueda auto-asignarse cuotas de cortesía |
| Objetivo | Garantizar HTTP 403 en POST /api/tickets/courtesy/quota (solo admin) |
| Precondiciones | Token con rol gestor |
| Datos de prueba | POST /api/tickets/courtesy/quota |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Intento de asignación de cuota | HTTP 403 Forbidden | HTTP 403 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-038_gestor_quota_creation_rejected_sec_evidence.json](evidencias/gestor/CP-GES-038_gestor_quota_creation_rejected_sec_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
