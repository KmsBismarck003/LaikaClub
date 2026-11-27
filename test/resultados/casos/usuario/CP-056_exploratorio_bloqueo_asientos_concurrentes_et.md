## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-056 | Fecha de ejecución | 2026-11-16 16:14:26 |
| Nombre de la prueba | exploratorio_bloqueo_asientos_concurrentes_et | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Exploratorio / Bloqueo Concurrente de Butacas | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | ET |
| Tipo de prueba | Exploratorio |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Explora la resistencia a colisiones cuando se envía una segunda solicitud de bloqueo para un asiento que ya se encuentra retenido. |
| Objetivo | Verificar que el segundo intento sea controlado y no genere duplicidad ni inconsistencia en la memoria de bloqueo. |
| Precondiciones | Servicio de tickets activo. |
| Datos de prueba | Event ID: 19, Seat ID: 'QA-ET-SEAT-01' |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Emitir primer bloqueo sobre asiento libre | HTTP 200 y asiento reservado | HTTP 200 | ✓ |
| 2 | Emitir segundo bloqueo inmediato sobre el mismo asiento | HTTP 200 (renovación) o 409 (conflicto) | HTTP 409 | ✓ |
| 3 | Liberar asiento para restaurar estado original | Asiento liberado | Liberado | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-056_exploratorio_bloqueo_asientos_concurrentes_et_evidence.json](evidencias/usuario/CP-056_exploratorio_bloqueo_asientos_concurrentes_et_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El gestor de bloqueo maneja los intentos repetidos sin colapso transaccional. |
