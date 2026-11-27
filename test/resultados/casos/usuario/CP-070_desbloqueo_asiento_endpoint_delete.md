## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-070 | Fecha de ejecución | 2026-11-16 16:14:02 |
| Nombre de la prueba | desbloqueo_asiento_endpoint_delete | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Desbloqueo de Asientos | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa la desasignación de un asiento bloqueado mediante DELETE /api/tickets/lock. |
| Objetivo | Garantizar que el asiento quede disponible inmediatamente para otros usuarios. |
| Precondiciones | Asiento bloqueado previamente por el usuario. |
| Datos de prueba | Event ID: 19, Seat ID: 'QA-API-UNLOCK-01' |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Bloquear asiento preliminarmente | Bloqueo establecido | Bloqueado | ✓ |
| 2 | Enviar DELETE /api/tickets/lock | HTTP 200 OK con {'status': 'success'} | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-070_desbloqueo_asiento_endpoint_delete_evidence.json](evidencias/usuario/CP-070_desbloqueo_asiento_endpoint_delete_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | La liberación de butacas opera de manera atómica. |
