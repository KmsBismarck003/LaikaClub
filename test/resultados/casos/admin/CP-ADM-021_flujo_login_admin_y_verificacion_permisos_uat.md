## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-021 | Fecha de ejecución | 2026-11-16 16:15:19 |
| Nombre de la prueba | flujo_login_admin_y_verificacion_permisos_uat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UAT / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UAT |
| Tipo de prueba | Aceptación de Usuario |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Flujo de aceptación de inicio de sesión del Administrador |
| Objetivo | Validar ingreso oficial a la plataforma y recepción del perfil con rol admin |
| Precondiciones | Credenciales maestras de administración |
| Datos de prueba | admin@laikaclub.com / gearsof2 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Iniciar sesión como Administrador | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar emisión de token y rol admin | Token presente y role=='admin' | role=admin | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-021_flujo_login_admin_y_verificacion_permisos_uat_evidence.json](evidencias/admin/CP-ADM-021_flujo_login_admin_y_verificacion_permisos_uat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
