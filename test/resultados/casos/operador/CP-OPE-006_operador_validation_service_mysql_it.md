## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-006 | Fecha de ejecución | 2026-11-16 16:14:34 |
| Nombre de la prueba | operador_validation_service_mysql_it | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | IT / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | IT |
| Tipo de prueba | Integración / Base de datos |
| Técnica | Caja gris |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar integración ContextualValidationService <-> laika_tickets.ticket_validation_logs |
| Objetivo | Validar conexión real y consulta de registros de auditoría de accesos |
| Precondiciones | Base de datos laika_tickets |
| Datos de prueba | SELECT count(*) FROM ticket_validation_logs |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar registros de validación en MySQL | Consulta exitosa con conteo >= 0 | Total logs: 229 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-006_operador_validation_service_mysql_it_evidence.json](evidencias/operador/CP-OPE-006_operador_validation_service_mysql_it_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
