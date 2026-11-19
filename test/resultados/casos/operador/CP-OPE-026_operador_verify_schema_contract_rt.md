## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-026 | Fecha de ejecución | 2026-11-16 16:14:51 |
| Nombre de la prueba | operador_verify_schema_contract_rt | Responsable (tester) | QA Automation |
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
| Descripción | Comprobar estabilidad e invarianza del contrato de verificación de boletos |
| Objetivo | Verificar presencia de campos valid, actionable, statusCode, statusTitle en respuesta |
| Precondiciones | Endpoint POST /api/tickets/verify |
| Datos de prueba | TKT-C853F390 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Validar contrato de respuesta verify | Todos los campos presentes | HTTP 200, match=True | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-026_operador_verify_schema_contract_rt_evidence.json](evidencias/operador/CP-OPE-026_operador_verify_schema_contract_rt_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
