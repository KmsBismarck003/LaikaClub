## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-007 | Fecha de ejecución | 2026-11-16 16:14:34 |
| Nombre de la prueba | gestor_courtesy_service_mysql_it | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | IT / Gestor | Ambiente | QA / Docker Live Services |
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
| Descripción | Comprobar integración CourtesyService <-> laika_tickets.courtesy_quotas |
| Objetivo | Validar esquema y disponibilidad de tablas de cortesías |
| Precondiciones | Base de datos laika_tickets |
| Datos de prueba | DESCRIBE courtesy_quotas |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Verificar columnas en courtesy_quotas | Todas las columnas requeridas | Columnas: ['id', 'created_at', 'event_function_id', 'event_id', 'issued_count', 'manager_user_id', 'max_allowed', 'section_name', 'updated_at'] | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-007_gestor_courtesy_service_mysql_it_evidence.json](evidencias/gestor/CP-GES-007_gestor_courtesy_service_mysql_it_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
