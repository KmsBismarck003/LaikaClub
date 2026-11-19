## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-004 | Fecha de ejecución | 2026-11-16 16:15:32 |
| Nombre de la prueba | admin_b2b_contract_date_validator_ut | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UT / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UT |
| Tipo de prueba | Lógica / Validación |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar reglas de temporalidad en contratos B2B |
| Objetivo | Verificar restricciones de fechas de inicio y fin |
| Precondiciones | Formato ISO YYYY-MM-DD |
| Datos de prueba | 2026-01-01 a 2026-12-31 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Contrato anual | True | True (Válido) | ✓ |
| 2 | Fecha fin invertida | False | False (La fecha de fin no puede ser anterior a la de inicio) | ✓ |
| 3 | Vigencia menor a 30 días | False | False (El contrato debe tener una vigencia mínima de 30 días) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-004_admin_b2b_contract_date_validator_ut_evidence.json](evidencias/admin/CP-ADM-004_admin_b2b_contract_date_validator_ut_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
