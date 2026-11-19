## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-016 | Fecha de ejecución | 2026-11-16 16:15:17 |
| Nombre de la prueba | operador_audit_trail_consistency_st | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | ST / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | ST |
| Tipo de prueba | Integridad / Auditoría |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evaluar consistencia cronológica en la bitácora de validaciones de acceso |
| Objetivo | Verificar que cada escaneo genere un registro con created_at no nulo |
| Precondiciones | Bitácora de validaciones |
| Datos de prueba | GET /api/tickets/validations/history |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Validar integridad estructural de logs | ticketCode presente en cada log | Total: 234 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-016_operador_audit_trail_consistency_st_evidence.json](evidencias/operador/CP-OPE-016_operador_audit_trail_consistency_st_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
