## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-059 | Fecha de ejecución | 2026-11-16 12:56:27 |
| Nombre de la prueba | login_credenciales_invalidas_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Autenticación | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Negativo |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa el rechazo de la autenticación cuando se proporciona un correo existente pero una contraseña errónea. |
| Objetivo | Verificar que el backend retorne HTTP 401 Unauthorized y no expida ningún token JWT. |
| Precondiciones | Usuario existente en el sistema. |
| Datos de prueba | Email: qa_user_test@laikaclub.com, Contraseña: 'PasswordTotalmenteIncorrecto!' |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar POST con contraseña errónea | HTTP 401 Unauthorized | HTTP 401 | ✓ |
| 2 | Verificar que NO se emita token JWT | Token ausente en respuesta | Token presente: No (Seguro) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-059_login_credenciales_invalidas_post_evidence.json](evidencias/CP-059_login_credenciales_invalidas_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El servicio rechaza limpiamente credenciales erróneas. |
