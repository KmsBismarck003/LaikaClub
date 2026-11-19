## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-047 | Fecha de ejecución | 2026-11-16 16:14:24 |
| Nombre de la prueba | gestor_complete_session_flow_e2e | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | E2E / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | E2E |
| Tipo de prueba | End-to-End / Flujo Completo |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Ejecutar flujo completo de sesión y supervisión del Gestor |
| Objetivo | Login -> Métricas Dashboard -> Listado de Eventos -> Detalle de Boletos y Revenue -> Mercancía -> Logout |
| Precondiciones | Credenciales oficiales de Gestor |
| Datos de prueba | Sesión interactiva completa |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Iniciar sesión como Gestor | HTTP 200 con JWT | HTTP 200 | ✓ |
| 2 | Consultar métricas generales del dashboard | HTTP 200 | HTTP 200 | ✓ |
| 3 | Consultar catálogo de eventos asignados | HTTP 200 con eventos | HTTP 200, total=33 | ✓ |
| 4 | Auditar ingresos del evento 100031 | HTTP 200 | HTTP 200 | ✓ |
| 5 | Verificar catálogo de mercancía oficial | HTTP 200 | HTTP 200 | ✓ |
| 6 | Cerrar sesión de Gestor | HTTP 200/204 | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-047_gestor_complete_session_flow_e2e_evidence.json](evidencias/gestor/CP-GES-047_gestor_complete_session_flow_e2e_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
