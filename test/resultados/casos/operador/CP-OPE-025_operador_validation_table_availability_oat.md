## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-025 | Fecha de ejecución | 2026-11-16 16:14:36 |
| Nombre de la prueba | operador_validation_table_availability_oat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | OAT / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | OAT |
| Tipo de prueba | Operativo / Base de datos |
| Técnica | Caja gris |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar disponibilidad de la tabla ticket_validation_logs en MySQL |
| Objetivo | Validar que el motor InnoDB permita operaciones de inserción y lectura |
| Precondiciones | MySQL corriendo en puerto 3306 |
| Datos de prueba | CHECK TABLE ticket_validation_logs |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | CHECK TABLE ticket_validation_logs | Status OK | Resultado: (('laika_tickets.ticket_validation_logs', 'check', 'status', 'OK'),) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-025_operador_validation_table_availability_oat_evidence.json](evidencias/operador/CP-OPE-025_operador_validation_table_availability_oat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
