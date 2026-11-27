## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-061 | Fecha de ejecución | 2026-11-16 12:56:30 |
| Nombre de la prueba | register_endpoint_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Registro de Usuario | Ambiente | QA / Docker Live Services |
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
| Descripción | Evalúa el registro exitoso de una nueva cuenta de usuario mediante POST /api/auth/register. |
| Objetivo | Verificar que el backend retorne HTTP 200/201 con token de sesión y persista el nuevo registro con rol 'usuario'. |
| Precondiciones | Servicio de autenticación y MySQL disponibles. |
| Datos de prueba | Usuario dinámico con timestamp |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar POST a /api/auth/register con 'api_reg_test_1794855390@laikaclub.com' | HTTP 200 o 201 Creado | HTTP 200 | ✓ |
| 2 | Verificar retorno de token y datos de usuario | Token emitido y email coincidente | Token: Sí, Email: api_reg_test_1794855390@laikaclub.com | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-061_register_endpoint_post_evidence.json](evidencias/CP-061_register_endpoint_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El endpoint de registro procesa la creación de usuario conforme al contrato. |
