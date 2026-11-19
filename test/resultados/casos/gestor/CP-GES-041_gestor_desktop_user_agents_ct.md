## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-041 | Fecha de ejecución | 2026-11-16 16:14:15 |
| Nombre de la prueba | gestor_desktop_user_agents_ct | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | CT / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | CT |
| Tipo de prueba | Compatibilidad / Navegadores |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar consistencia de respuestas con diferentes navegadores web |
| Objetivo | Garantizar HTTP 200 en /api/manager/events para Chrome, Firefox, Safari y Edge |
| Precondiciones | User-Agents representativos de escritorio |
| Datos de prueba | Chrome, Firefox, Safari, Edge |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Petición desde Chrome | HTTP 200 | HTTP 200 | ✓ |
| 2 | Petición desde Firefox | HTTP 200 | HTTP 200 | ✓ |
| 3 | Petición desde Safari | HTTP 200 | HTTP 200 | ✓ |
| 4 | Petición desde Edge | HTTP 200 | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-041_gestor_desktop_user_agents_ct_evidence.json](evidencias/gestor/CP-GES-041_gestor_desktop_user_agents_ct_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
