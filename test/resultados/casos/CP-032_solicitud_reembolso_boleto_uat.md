## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-032 | Fecha de ejecución | 2026-11-16 12:56:56 |
| Nombre de la prueba | solicitud_reembolso_boleto_uat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UAT / Cancelaciones y Reembolsos (RefundTracker) | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UAT |
| Tipo de prueba | Aceptación de Usuario |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa el módulo de reembolsos del usuario, comprobando que pueda consultar el historial de cancelaciones en /user/refunds. |
| Objetivo | Garantizar que el rastreador de reembolsos despliegue las solicitudes con su estado (pendiente, aprobada, rechazada). |
| Precondiciones | Usuario autenticado con rol usuario. |
| Datos de prueba | Token JWT del usuario de prueba. |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Ingresar a la vista de 'Mis Reembolsos' (RefundTracker) | HTTP 200 con listado de solicitudes | HTTP 200, 0 solicitudes encontradas | ✓ |
| 2 | Verificar visualización de estado vacío sin solicitudes | Lista vacía sin errores de renderizado | Sin solicitudes activas | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-032_solicitud_reembolso_boleto_uat_evidence.json](evidencias/CP-032_solicitud_reembolso_boleto_uat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El rastreador de reembolsos provee certidumbre y transparencia al usuario. |
