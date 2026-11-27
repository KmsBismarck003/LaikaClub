## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-001 | Fecha de ejecución | 2026-11-16 16:15:34 |
| Nombre de la prueba | operador_qr_parser_ut | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UT / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UT |
| Tipo de prueba | Lógica / QR |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar normalización y extracción de código de boleto desde lectura QR |
| Objetivo | Garantizar formato unificado TKT-XXXXX desde strings crudos o URLs |
| Precondiciones | Entradas de scanner óptico |
| Datos de prueba | https://laikaclub.com/t/TKT-C853F390 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Parsear URL de boleto | TKT-C853F390 | TKT-C853F390 | ✓ |
| 2 | Normalizar código alfanumérico sin prefijo | TKT-C853F390 | TKT-C853F390 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-001_operador_qr_parser_ut_evidence.json](evidencias/operador/CP-OPE-001_operador_qr_parser_ut_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
