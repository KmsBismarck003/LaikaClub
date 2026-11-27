## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-022 | Fecha de ejecución | 2026-11-16 16:15:28 |
| Nombre de la prueba | gestor_event_lifecycle_uat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UAT / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UAT |
| Tipo de prueba | Aceptación / Ciclo de Vida |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar ciclo de vida completo de evento por el Gestor |
| Objetivo | Alta en borrador -> Publicación -> Despublicación -> Eliminación lógica |
| Precondiciones | Gestor autenticado |
| Datos de prueba | POST /api/manager/events y transiciones PATCH/PUT |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Crear evento borrador | HTTP 200/201 con ID generado | HTTP 200, ID=100032 | ✓ |
| 2 | Publicar evento | HTTP 200 | HTTP 200 | ✓ |
| 3 | Mover a borrador (unpublish) | HTTP 200 | HTTP 200 | ✓ |
| 4 | Eliminar evento | HTTP 200 | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-022_gestor_event_lifecycle_uat_evidence.json](evidencias/gestor/CP-GES-022_gestor_event_lifecycle_uat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
