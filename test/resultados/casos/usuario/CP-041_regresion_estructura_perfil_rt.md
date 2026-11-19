## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-041 | Fecha de ejecución | 2026-11-16 16:14:59 |
| Nombre de la prueba | regresion_estructura_perfil_rt | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Regresión / DTOs de Usuario | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | RT |
| Tipo de prueba | Regresión |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa que el endpoint GET /api/auth/users/me preserve todos los campos requeridos por las páginas UserProfile y UserDashboard. |
| Objetivo | Garantizar la compatibilidad hacia atrás en las propiedades: id, email, firstName, lastName, role, permissions, status. |
| Precondiciones | Usuario autenticado con sesión válida. |
| Datos de prueba | Token JWT del usuario de prueba |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar endpoint de perfil /api/auth/users/me | HTTP 200 OK | HTTP 200 | ✓ |
| 2 | Validar presencia de todos los atributos en el DTO UserProfileResponse | 7 campos obligatorios presentes: id, email, firstName, lastName, role, permissions, status | Faltantes: Ninguno (DTO 100% íntegro) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-041_regresion_estructura_perfil_rt_evidence.json](evidencias/usuario/CP-041_regresion_estructura_perfil_rt_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El contrato del perfil de usuario se mantiene 100% compatible con el frontend. |
