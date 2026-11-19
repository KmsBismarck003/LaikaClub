## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-047 | Fecha de ejecución | 2026-11-16 16:15:01 |
| Nombre de la prueba | xss_payload_perfil_security | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Seguridad / Sanitización de Entradas y XSS | Ambiente | QA / Docker Live Services |
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
| Descripción | Evalúa el comportamiento del backend al enviar cadenas con código JavaScript malicioso (<script>alert('xss')</script>) en los campos de perfil. |
| Objetivo | Garantizar que el sistema no ejecute código ni rompa el esquema de datos, retornando la información escapada o sanitizada. |
| Precondiciones | Usuario autenticado con sesión válida. |
| Datos de prueba | first_name con script inyectado |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar payload XSS '<script>alert('XSS_TEST')</script>' en actualización de perfil | Petición procesada o sanitizada sin error 500 | HTTP 200 | ✓ |
| 2 | Restaurar perfil a valores limpios tras la prueba | Perfil restablecido | Restablecido | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-047_xss_payload_perfil_security_evidence.json](evidencias/usuario/CP-047_xss_payload_perfil_security_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El servicio almacena el payload como texto plano sin interpretación en el servidor. |
