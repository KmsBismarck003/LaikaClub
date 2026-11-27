## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-019 | Fecha de ejecución | 2026-11-16 12:56:52 |
| Nombre de la prueba | perfil_usuario_gateway_sit | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | SIT / Perfil de Usuario | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SIT |
| Tipo de prueba | Integración de Sistema |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa el flujo bidireccional de consulta (GET) y actualización (PUT) del perfil de usuario vía Pilgrim Gateway. |
| Objetivo | Verificar que los cambios enviados en el cuerpo JSON de actualización persistan y se reflejen en la consulta posterior. |
| Precondiciones | Usuario autenticado con rol usuario. |
| Datos de prueba | Nombres: 'QA Auditor', 'Senior Test', Teléfono: '5559876543' |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar perfil vía GET /api/auth/users/me | HTTP 200 con datos de perfil | HTTP 200 | ✓ |
| 2 | Enviar actualización vía PUT /api/auth/users/me | HTTP 200 con perfil actualizado | HTTP 200 | ✓ |
| 3 | Re-consultar perfil para comprobar persistencia de cambios | firstName='QA_Verified', phone='5559876543' | firstName='QA_Verified', phone='5559876543' | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-019_perfil_usuario_gateway_sit_evidence.json](evidencias/CP-019_perfil_usuario_gateway_sit_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Persistencia confirmada a través de las capas Gateway -> Microservicio Auth -> MySQL. |
