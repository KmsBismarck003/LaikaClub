## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-059 | Fecha de ejecución | 2026-11-16 16:14:17 |
| Nombre de la prueba | operador_tickets_status_consistency_db | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | DATABASE / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | DATABASE |
| Tipo de prueba | Base de Datos / Consistencia |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar en laika_tickets.tickets que TKT-C853F390 mantenga estatus active y consistencia. |
| Objetivo | Garantizar que el boleto de prueba para control de acceso mantenga integridad relacional |
| Precondiciones | Base de datos laika_tickets disponible |
| Datos de prueba | Ticket: TKT-C853F390 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Verificar registro de ticket en MySQL | Estatus active en base de datos | ID=200181, status=active | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-059_operador_tickets_status_consistency_db_evidence.json](evidencias/operador/CP-OPE-059_operador_tickets_status_consistency_db_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Ticket ID=200181, status=active, eventId=100001 |
