## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-029 | Fecha de ejecución | 2026-11-16 16:14:49 |
| Nombre de la prueba | operador_gate_verification_latency_pt | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | PT / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | PT |
| Tipo de prueba | Rendimiento / Latencia |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Medir tiempo de respuesta en escaneo de acceso en torniquete (target < 200ms) |
| Objetivo | Garantizar fluidez inmediata en puertas de acceso masivo |
| Precondiciones | Operador autenticado |
| Datos de prueba | POST /api/tickets/verify con TKT-C853F390 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Medir latencia en validación de boleto | < 500ms en local | 109.44ms | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-029_operador_gate_verification_latency_pt_evidence.json](evidencias/operador/CP-OPE-029_operador_gate_verification_latency_pt_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
