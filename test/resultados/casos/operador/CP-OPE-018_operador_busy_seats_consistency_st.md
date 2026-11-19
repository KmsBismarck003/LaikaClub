## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-018 | Fecha de ejecución | 2026-11-16 16:15:17 |
| Nombre de la prueba | operador_busy_seats_consistency_st | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | ST / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | ST |
| Tipo de prueba | Integridad / Asientos |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evaluar consistencia de asientos ocupados en taquilla operativa |
| Objetivo | Garantizar que /api/tickets/busy-seats/{id} devuelva un array válido de strings |
| Precondiciones | Evento ID 100001 |
| Datos de prueba | GET /api/tickets/busy-seats/100001 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Validar lista de asientos ocupados | Array JSON de identificadores | HTTP 200, ocupados=4 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-018_operador_busy_seats_consistency_st_evidence.json](evidencias/operador/CP-OPE-018_operador_busy_seats_consistency_st_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
