## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-073 | Fecha de ejecución | 2026-11-16 16:14:17 |
| Nombre de la prueba | gestor_events_persistence_db | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | DATABASE / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | DATABASE |
| Tipo de prueba | Persistencia / Base de datos |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar persistencia transaccional en tabla laika_events.events |
| Objetivo | Validar que los eventos de gestor cuenten con created_by, status y total_tickets |
| Precondiciones | Base de datos laika_events |
| Datos de prueba | SELECT id, name, created_by, status FROM events |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar registros en laika_events.events | Al menos 1 registro persistido | Total encontrados: 5 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-073_gestor_events_persistence_db_evidence.json](evidencias/gestor/CP-GES-073_gestor_events_persistence_db_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
