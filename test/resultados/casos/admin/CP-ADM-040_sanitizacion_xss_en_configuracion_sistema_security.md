## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-040 | Fecha de ejecución | 2026-11-16 16:14:59 |
| Nombre de la prueba | sanitizacion_xss_en_configuracion_sistema_security | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | SECURITY / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SECURITY |
| Tipo de prueba | Seguridad / XSS |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar almacenamiento seguro de payloads XSS en parámetros de configuración |
| Objetivo | Garantizar que el sistema almacene o sanitice tags de script sin ejecución perjudicial |
| Precondiciones | Admin autenticado |
| Datos de prueba | POST /api/config/xss_test_key |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar payload XSS a configuración | HTTP 200 persistencia como texto plano | HTTP 200, valor=<script>alert('XSS_ADMIN_TEST')</script> | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-040_sanitizacion_xss_en_configuracion_sistema_security_evidence.json](evidencias/admin/CP-ADM-040_sanitizacion_xss_en_configuracion_sistema_security_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
