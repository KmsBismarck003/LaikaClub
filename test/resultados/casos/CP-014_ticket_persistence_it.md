## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-014 | Fecha de ejecución | 2026-11-16 12:56:34 |
| Nombre de la prueba | ticket_persistence_it | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Tickets / Persistencia MySQL | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | IT |
| Tipo de prueba | Integración |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa la persistencia y lectura física de boletos en la base de datos laika_tickets. |
| Objetivo | Verificar que los boletos asociados a un usuario existan en la tabla física 'tickets' con datos íntegros. |
| Precondiciones | Microservicio tickets y MySQL activos. |
| Datos de prueba | Consulta de tickets activos para el usuario de prueba. |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar boletos del usuario vía GET /api/tickets/my-tickets | HTTP 200 con lista de boletos (vacía o con registros) | HTTP 200, 19 boletos retornados | ✓ |
| 2 | Verificar coincidencia de cardinalidad entre API y MySQL | Conteo API (19) == Conteo DB (19) | API=19, DB=19 | ✓ |
| 3 | Validar concordancia de códigos de boleto entre capa API y MySQL | Códigos de boleto consistentes | Códigos validados: 19 registros | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-014_ticket_persistence_it_evidence.json](evidencias/CP-014_ticket_persistence_it_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Persistencia relacional de boletos confirmada con integridad referencial. |
