## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-066 | Fecha de ejecución | 2026-11-16 12:56:27 |
| Nombre de la prueba | evento_detalle_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Detalle de Evento | Ambiente | QA / Docker Live Services |
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
| Descripción | Evalúa la obtención del detalle de un evento por su ID primario mediante GET /api/events/{id}. |
| Objetivo | Garantizar que el servicio retorne HTTP 200 con el objeto completo del evento (funciones, mapa de asientos, precios). |
| Precondiciones | Evento 19 existente en la base de datos. |
| Datos de prueba | ID de evento: 19 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar GET /api/events/19 | HTTP 200 OK | HTTP 200 | ✓ |
| 2 | Verificar coincidencia del ID e información descriptiva | ID=19 y name no nulo | ID=19, Name='Afterlife México 2026' | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-066_evento_detalle_endpoint_get_evidence.json](evidencias/CP-066_evento_detalle_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El detalle del evento contiene la información requerida para el flujo de compra. |
