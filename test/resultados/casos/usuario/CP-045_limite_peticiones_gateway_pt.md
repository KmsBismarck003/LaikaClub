## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-045 | Fecha de ejecución | 2026-11-16 16:14:47 |
| Nombre de la prueba | limite_peticiones_gateway_pt | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Rendimiento / Estrés de Gateway | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | PT |
| Tipo de prueba | Estrés |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Somete a Pilgrim Gateway a una ráfaga continua de 25 peticiones a endpoint de salud y eventos para verificar que no se produzcan caídas de proxy (502 / 504). |
| Objetivo | Verificar que el Gateway asíncrono no sature su event loop ni cierre sockets prematuramente. |
| Precondiciones | Pilgrim Gateway en ejecución en puerto 8000. |
| Datos de prueba | Ráfaga de 25 peticiones GET a /api/health |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Transmitir ráfaga rápida de 25 peticiones a http://localhost:8000/api/health | 25 respuestas HTTP 200 sin errores 502/504 | 25/25 completadas exitosamente | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-045_limite_peticiones_gateway_pt_evidence.json](evidencias/usuario/CP-045_limite_peticiones_gateway_pt_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El Gateway mantiene su estabilidad y no genera bloqueos de socket. |
