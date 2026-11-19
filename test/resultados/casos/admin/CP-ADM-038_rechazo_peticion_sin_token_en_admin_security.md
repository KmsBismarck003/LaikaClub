## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-038 | Fecha de ejecución | 2026-11-16 16:14:59 |
| Nombre de la prueba | rechazo_peticion_sin_token_en_admin_security | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | SECURITY / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SECURITY |
| Tipo de prueba | Seguridad / Autenticación |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Verificar rechazo estricto de peticiones sin token en rutas de administración |
| Objetivo | Comprobar que una petición sin header Authorization sea rechazada de inmediato |
| Precondiciones | Sin token de autorización |
| Datos de prueba | GET /api/admin/users |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET sin token en endpoint administrativo | HTTP 401/403/Access Denied | HTTP 401 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-038_rechazo_peticion_sin_token_en_admin_security_evidence.json](evidencias/admin/CP-ADM-038_rechazo_peticion_sin_token_en_admin_security_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
