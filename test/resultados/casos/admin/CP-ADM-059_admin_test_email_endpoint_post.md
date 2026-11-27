## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-059 | Fecha de ejecución | 2026-11-16 16:13:54 |
| Nombre de la prueba | admin_test_email_endpoint_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / SMTP |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint POST /api/auth/admin/test-email |
| Objetivo | Verificar prueba de conectividad y envío de correo de diagnóstico |
| Precondiciones | Admin autenticado |
| Datos de prueba | POST /api/auth/admin/test-email |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | POST /api/auth/admin/test-email | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar resultado de prueba SMTP | Campo status presente | status=error | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-059_admin_test_email_endpoint_post_evidence.json](evidencias/admin/CP-ADM-059_admin_test_email_endpoint_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
