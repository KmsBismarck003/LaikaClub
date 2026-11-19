## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-023 | Fecha de ejecución | 2026-11-16 16:15:53 |
| Nombre de la prueba | flujo_auth_rol_cruzado_operador_a_admin_sec | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Seguridad / Roles | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SECURITY |
| Tipo de prueba | Seguridad / RBAC |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar rechazo de autenticación cruzada: operador intentando modificar configuración admin |
| Objetivo | Garantizar que terminales de operador no puedan alterar parámetros de configuración administrativa |
| Precondiciones | Token de rol operador |
| Datos de prueba | Ruta: PUT /api/config |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Modificar /api/config con rol operador | HTTP 401/403 Denegado | HTTP 403 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-023_flujo_auth_rol_cruzado_operador_a_admin_sec_evidence.json](evidencias/admin/CP-ADV-023_flujo_auth_rol_cruzado_operador_a_admin_sec_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Acceso denegado correctamente: HTTP 403 |
