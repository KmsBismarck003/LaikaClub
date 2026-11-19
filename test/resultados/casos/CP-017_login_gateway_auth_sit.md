## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-017 | Fecha de ejecución | 2026-11-16 12:56:47 |
| Nombre de la prueba | login_gateway_auth_sit | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | SIT / Autenticación Ecosistema | Ambiente | QA / Docker Live Services |
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
| Descripción | Evalúa el flujo real de autenticación cruzando el API Gateway (Pilgrim:8000) hacia el microservicio laika_auth (8101) y la persistencia en MySQL. |
| Objetivo | Verificar que el Gateway proxee limpiamente la petición POST /api/auth/login, conserve cabeceras y devuelva el JWT firmado. |
| Precondiciones | Pilgrim Gateway (8000) y microservicio Auth (8101) activos sin ningún mock. |
| Datos de prueba | Email: qa_user_test@laikaclub.com, Payload JSON estructurado |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar POST a http://localhost:8000/api/auth/login a través de Pilgrim Gateway | HTTP 200 OK recibido desde el microservicio Auth | HTTP 200 | ✓ |
| 2 | Validar emisión y longitud del token JWT | Token JWT presente y no vacío | Token recibido: Sí (longitud: 203) | ✓ |
| 3 | Validar rol del usuario autenticado en la respuesta del gateway | Rol = 'usuario' | Rol retornado: 'usuario' | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-017_login_gateway_auth_sit_evidence.json](evidencias/CP-017_login_gateway_auth_sit_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El API Gateway canaliza y retorna la respuesta de autenticación con fidelidad absoluta. |
