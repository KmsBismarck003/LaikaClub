## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-027 | Fecha de ejecución | 2026-11-16 16:14:51 |
| Nombre de la prueba | operador_history_schema_contract_rt | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | RT / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | RT |
| Tipo de prueba | Regresión / Contrato |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar estabilidad del contrato de historial de validaciones |
| Objetivo | Verificar que cada registro contenga ticketCode y id |
| Precondiciones | GET /api/tickets/validations/history |
| Datos de prueba | Contrato JSON |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Validar contrato de historial de validaciones | ticketCode en array JSON | HTTP 200, elementos=230 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-027_operador_history_schema_contract_rt_evidence.json](evidencias/operador/CP-OPE-027_operador_history_schema_contract_rt_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
