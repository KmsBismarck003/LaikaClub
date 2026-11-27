## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-009 | Fecha de ejecución | 2026-11-16 16:14:34 |
| Nombre de la prueba | gestor_venue_service_mysql_it | Responsable (tester) | QA Automation |
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
| Descripción | Comprobar integración VenueService <-> laika_events.venues & venue_rooms |
| Objetivo | Validar consulta relacional entre recintos y salas |
| Precondiciones | Base de datos laika_events |
| Datos de prueba | SELECT v.id, r.id FROM venues v JOIN venue_rooms r |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consulta relacional recintos y salas | Recintos con salas | Total inspeccionados: 5 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-009_gestor_venue_service_mysql_it_evidence.json](evidencias/gestor/CP-GES-009_gestor_venue_service_mysql_it_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
