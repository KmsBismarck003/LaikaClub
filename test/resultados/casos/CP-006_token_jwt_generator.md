## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-006 | Fecha de ejecución | 2026-11-16 12:56:57 |
| Nombre de la prueba | token_jwt_generator | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Seguridad / Auth Token Backend | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UT |
| Tipo de prueba | Seguridad |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa unitariamente la generación y decodificación de tokens JWT asegurando la integridad de claims de identidad. |
| Objetivo | Verificar que todo token contenga sub (email), user_id y role. |
| Precondiciones | Librería criptográfica PyJWT activa. |
| Datos de prueba | Usuario: ID 30078, Email: qa_user_test@laikaclub.com, Rol: usuario |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Generar token JWT firmado con HS256 | Token generado con éxito | Longitud: 219 chars | ✓ |
| 2 | Verificar presencia de claims obligatorios | Todos los claims presentes | dict_keys(['user_id', 'sub', 'role', 'iat', 'exp']) | ✓ |
| 3 | Verificar consistencia de datos de usuario | Rol=usuario, user_id=30078 | Rol=usuario, user_id=30078 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-006_token_jwt_generator_evidence.json](evidencias/CP-006_token_jwt_generator_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Claims conformes con el estándar RFC 7519. |
