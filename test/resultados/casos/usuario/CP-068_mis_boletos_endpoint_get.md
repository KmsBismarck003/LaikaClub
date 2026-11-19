## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-068 | Fecha de ejecución | 2026-11-16 16:14:06 |
| Nombre de la prueba | mis_boletos_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Cartera de Boletos | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa la obtención de los boletos adquiridos por el usuario actual mediante GET /api/tickets/my-tickets con Bearer token. |
| Objetivo | Verificar que el servicio responda con código HTTP 200 y una lista con las entradas del usuario. |
| Precondiciones | Usuario autenticado. |
| Datos de prueba | Token JWT del usuario de prueba |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar GET /api/tickets/my-tickets con cabecera Authorization | HTTP 200 OK | HTTP 200 | ✓ |
| 2 | Verificar que el cuerpo sea una lista JSON | Tipo lista devuelto | Tipo: list, Conteo: 61 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-068_mis_boletos_endpoint_get_evidence.json](evidencias/usuario/CP-068_mis_boletos_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El servicio de tickets aísla correctamente los boletos correspondientes al usuario en sesión. |
