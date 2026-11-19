## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-008 | Fecha de ejecución | 2026-11-16 16:14:34 |
| Nombre de la prueba | operador_validation_repo_mysql_it | Responsable (tester) | QA Automation |
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
| Descripción | Comprobar esquema relacional de ticket_validation_logs |
| Objetivo | Validar columnas críticas para auditoría de torniquete |
| Precondiciones | Base de datos laika_tickets |
| Datos de prueba | DESCRIBE ticket_validation_logs |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Verificar columnas en tabla de auditoría de accesos | Columnas requeridas presentes | Columnas: ['id', 'access_point', 'action_type', 'created_at', 'device_info', 'event_function_id', 'event_id', 'notes', 'operator_id', 'operator_name', 'platform', 'result_status', 'selected_event_id', 'selected_function_id', 'ticket_code', 'ticket_id', 'user_id', 'validation_date', 'validation_time'] | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-008_operador_validation_repo_mysql_it_evidence.json](evidencias/operador/CP-OPE-008_operador_validation_repo_mysql_it_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
