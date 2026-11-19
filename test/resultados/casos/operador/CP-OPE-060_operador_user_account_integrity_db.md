## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-060 | Fecha de ejecución | 2026-11-16 16:14:17 |
| Nombre de la prueba | operador_user_account_integrity_db | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | DATABASE / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | DATABASE |
| Tipo de prueba | Base de Datos / Autenticación |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar en laika_auth.users que operador@laikaclub.com tenga rol operador y status active. |
| Objetivo | Comprobar integridad de cuenta staff, permisos canValidateTickets y BCrypt hash |
| Precondiciones | Base de datos laika_auth disponible |
| Datos de prueba | Usuario: operador@laikaclub.com |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Verificar cuenta de operador en MySQL | Rol operador y status active | ID=2, role=operador, status=active | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-060_operador_user_account_integrity_db_evidence.json](evidencias/operador/CP-OPE-060_operador_user_account_integrity_db_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Usuario ID=2, Email=operador@laikaclub.com, Rol=operador, Status=active |
