## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-013 | Fecha de ejecución | 2026-11-16 16:14:27 |
| Nombre de la prueba | auth_service_mysql_it | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Autenticación / Persistencia MySQL | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | IT |
| Tipo de prueba | Integración |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprueba la integración directa entre el microservicio de autenticación y la base de datos MySQL real laika_auth. |
| Objetivo | Verificar que una autenticación exitosa consulte el registro real y actualice el campo last_login o auth_logs. |
| Precondiciones | Servicio laika_auth (puerto 8101) y contenedor MySQL activos sin mocks. |
| Datos de prueba | Email: qa_user_test@laikaclub.com |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar existencia del usuario directamente en laika_auth.users | Usuario con email qa_user_test@laikaclub.com existe | ID: 30078, Rol: usuario | ✓ |
| 2 | Enviar solicitud POST /api/auth/login con credenciales reales | HTTP 200 y token JWT emitido | HTTP 200, Token emitido: Sí | ✓ |
| 3 | Validar coincidencia entre el ID devuelto por el servicio y el ID de MySQL | ID API (30078) == ID MySQL (30078) | ID API=30078, ID DB=30078 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-013_auth_service_mysql_it_evidence.json](evidencias/usuario/CP-013_auth_service_mysql_it_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Integración transaccional y consulta entre AuthService y MySQL verificada con éxito real. |
