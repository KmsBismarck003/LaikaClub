## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-046 | Fecha de ejecución | 2026-11-16 16:15:00 |
| Nombre de la prueba | inyeccion_sql_login_security | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Seguridad / Prevención de Inyección SQL | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SECURITY |
| Tipo de prueba | Seguridad |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa la protección de las consultas SQL de login mediante sentencias preparadas (PreparedStatements/JPA) ante intentos de bypass de autenticación. |
| Objetivo | Verificar que payloads maliciosos no permitan saltarse la contraseña ni generen errores de sintaxis SQL (500). |
| Precondiciones | Servicio laika_auth en línea. |
| Datos de prueba | Payloads: "' OR '1'='1", "admin'--", "' UNION SELECT * FROM users--" |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Probar inyección SQL en campo email: '' OR '1'='1' | Petición rechazada con HTTP 401/400 sin filtrar error de base de datos | HTTP 422 (Inmune) | ✓ |
| 2 | Probar inyección SQL en campo email: 'admin@laikaclub.com'--' | Petición rechazada con HTTP 401/400 sin filtrar error de base de datos | HTTP 422 (Inmune) | ✓ |
| 3 | Probar inyección SQL en campo email: '' UNION SELECT 1, 'admin', 'hash'--' | Petición rechazada con HTTP 401/400 sin filtrar error de base de datos | HTTP 422 (Inmune) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-046_inyeccion_sql_login_security_evidence.json](evidencias/usuario/CP-046_inyeccion_sql_login_security_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El uso de Spring Data JPA y parámetros vinculados neutraliza completamente la inyección SQL. |
