## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-026 | Fecha de ejecución | 2026-11-16 16:15:16 |
| Nombre de la prueba | consulta_detalle_evento_st | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Sistema / Ficha de Evento | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | ST |
| Tipo de prueba | Funcional / Sistema |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa la respuesta de la ficha detallada de un evento público mediante GET /api/events/{eventId}. |
| Objetivo | Verificar que el evento incluya nombre, precio, fecha, recinto y funciones disponibles. |
| Precondiciones | Al menos un evento publicado en el sistema. |
| Datos de prueba | ID de evento: 19 o primer evento publicado disponible |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Identificar ID de evento activo para consulta | ID de evento válido | ID=20 | ✓ |
| 2 | Solicitar detalle vía GET /api/events/20 | HTTP 200 OK | HTTP 200 | ✓ |
| 3 | Validar campos mandatorios (nombre, recinto, precio) | Campos name y location/venue no vacíos | Name: 'Vive Latino 2026', Location: 'Aguascalientes' | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-026_consulta_detalle_evento_st_evidence.json](evidencias/usuario/CP-026_consulta_detalle_evento_st_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Ficha de evento contiene la información requerida para la experiencia del usuario. |
