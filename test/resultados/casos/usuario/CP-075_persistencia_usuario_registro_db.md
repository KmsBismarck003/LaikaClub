## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-075 | Fecha de ejecución | 2026-11-16 16:14:17 |
| Nombre de la prueba | persistencia_usuario_registro_db | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Base de Datos / laika_auth.users | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | DATABASE |
| Tipo de prueba | Base de Datos |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa directamente en la base de datos MySQL laika_auth la consistencia física del registro de usuario de prueba. |
| Objetivo | Verificar que el registro contenga hash BCrypt en password_hash, rol 'usuario', status 'active' y fecha de creación no nula. |
| Precondiciones | MySQL activo en localhost:3306. |
| Datos de prueba | Email: qa_user_test@laikaclub.com |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar fila del usuario 'qa_user_test@laikaclub.com' en laika_auth.users | Fila encontrada en la tabla física | ID=30078 | ✓ |
| 2 | Validar rol='usuario' y status='active' | Rol y estatus correctos | Rol=usuario, Status=active | ✓ |
| 3 | Validar que la contraseña esté cifrada con BCrypt ($2...) | Hash criptográfico irreversible | Prefijo de hash: $2a$10$ | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-075_persistencia_usuario_registro_db_evidence.json](evidencias/usuario/CP-075_persistencia_usuario_registro_db_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El registro de usuario en MySQL cumple con todos los atributos de persistencia requeridos. |
