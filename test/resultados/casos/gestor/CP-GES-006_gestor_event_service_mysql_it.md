## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-006 | Fecha de ejecución | 2026-11-16 16:14:34 |
| Nombre de la prueba | gestor_event_service_mysql_it | Responsable (tester) | QA Automation |
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
| Descripción | Comprobar integración EventService <-> laika_events.events |
| Objetivo | Validar conexión real y consulta de eventos asignados a gestor |
| Precondiciones | MySQL corriendo en puerto 3306 |
| Datos de prueba | SELECT id, name, created_by FROM events WHERE created_by = 3 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar eventos de gestor 3 en MySQL | Al menos 1 evento | Total encontrados: 33 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-006_gestor_event_service_mysql_it_evidence.json](evidencias/gestor/CP-GES-006_gestor_event_service_mysql_it_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
