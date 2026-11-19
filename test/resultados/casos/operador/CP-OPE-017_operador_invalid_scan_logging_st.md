## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-017 | Fecha de ejecución | 2026-11-16 16:15:17 |
| Nombre de la prueba | operador_invalid_scan_logging_st | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | ST / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | ST |
| Tipo de prueba | Seguridad / Registro |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evaluar que los intentos de acceso con boletos inválidos se auditen |
| Objetivo | Garantizar que un escaneo de código inexistente quede registrado en la base de datos |
| Precondiciones | Código inválido |
| Datos de prueba | POST /api/tickets/verify con TKT-FRAUDE-999 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Verificar boleto apócrifo | statusCode=INVALID_CODE | statusCode=INVALID_CODE | ✓ |
| 2 | Verificar persistencia en bitácora | Al menos 1 log para TKT-FRAUDE-999 | Logs registrados: 7 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-017_operador_invalid_scan_logging_st_evidence.json](evidencias/operador/CP-OPE-017_operador_invalid_scan_logging_st_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
