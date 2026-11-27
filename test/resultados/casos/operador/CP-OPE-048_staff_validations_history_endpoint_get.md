## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-048 | Fecha de ejecución | 2026-11-16 16:14:13 |
| Nombre de la prueba | staff_validations_history_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Operador | Ambiente | QA / Docker Live Services |
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
| Descripción | Validar que GET /api/staff/validations/history responda 200 OK con el listado de validaciones. |
| Objetivo | Comprobar visualización de historial de lecturas ópticas para staff de puerta |
| Precondiciones | Servicio laika_tickets activo; registros en tabla |
| Datos de prueba | N/A |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar GET /api/staff/validations/history | HTTP 200 OK | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-048_staff_validations_history_endpoint_get_evidence.json](evidencias/operador/CP-OPE-048_staff_validations_history_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | 200 OK obtenido con 219 entradas de auditoría |
