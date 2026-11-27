## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-007 | Fecha de ejecución | 2026-11-16 16:14:34 |
| Nombre de la prueba | operador_ticket_service_mysql_it | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | IT / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | IT |
| Tipo de prueba | Integración / Base de datos |
| Técnica | Caja gris |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar integración TicketService <-> laika_tickets.tickets |
| Objetivo | Validar consulta de boletos existentes con ticket_code y status |
| Precondiciones | Base de datos laika_tickets |
| Datos de prueba | SELECT ticket_code, status FROM tickets LIMIT 5 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar boleto activo en MySQL | Boleto TKT-C853F390 encontrado | Encontrado: (200181, 'TKT-C853F390', 'active') | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-007_operador_ticket_service_mysql_it_evidence.json](evidencias/operador/CP-OPE-007_operador_ticket_service_mysql_it_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
