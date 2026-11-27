## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-022 | Fecha de ejecución | 2026-11-16 16:15:18 |
| Nombre de la prueba | flujo_administracion_ciclo_vida_usuario_uat | Responsable (tester) | QA Automation |
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
| Descripción | Ciclo de vida completo de administración de usuarios por el Administrador |
| Objetivo | Crear usuario administrativo, cambiar su status a suspended y eliminarlo |
| Precondiciones | Admin autenticado |
| Datos de prueba | CRUD /api/admin/users |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Crear nuevo usuario administrativo | HTTP 200 y user_id asignado | HTTP 200, id=30186 | ✓ |
| 2 | Suspender cuenta de usuario | HTTP 200 | HTTP 200 | ✓ |
| 3 | Eliminar usuario de prueba | HTTP 200 | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-022_flujo_administracion_ciclo_vida_usuario_uat_evidence.json](evidencias/admin/CP-ADM-022_flujo_administracion_ciclo_vida_usuario_uat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
