## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-017 | Fecha de ejecución | 2026-11-16 16:15:16 |
| Nombre de la prueba | gestor_events_filtering_st | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | ST / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | ST |
| Tipo de prueba | Funcional / Filtros |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evaluar consistencia de filtrado de eventos de gestor |
| Objetivo | Verificar categorización y estado de los eventos retornados |
| Precondiciones | Eventos cargados en la plataforma |
| Datos de prueba | GET /api/manager/events |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Validar integridad estructural en eventos | status y name presentes | Total: 33 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-017_gestor_events_filtering_st_evidence.json](evidencias/gestor/CP-GES-017_gestor_events_filtering_st_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
