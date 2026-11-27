## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-067 | Fecha de ejecución | 2026-11-16 16:14:03 |
| Nombre de la prueba | evento_inexistente_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Detalle de Evento | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Manejo de Errores / Negativo |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa el comportamiento del microservicio de eventos ante la solicitud de un ID que no existe en el catálogo. |
| Objetivo | Garantizar que el servicio retorne código HTTP 404 Not Found sin excepciones internas 500. |
| Precondiciones | Servicio de eventos activo. |
| Datos de prueba | ID inexistente: 9999999 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar GET /api/events/9999999 con ID no registrado | HTTP 404 Not Found | HTTP 404 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-067_evento_inexistente_endpoint_get_evidence.json](evidencias/usuario/CP-067_evento_inexistente_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El servicio maneja con propiedad las referencias a recursos no encontrados. |
