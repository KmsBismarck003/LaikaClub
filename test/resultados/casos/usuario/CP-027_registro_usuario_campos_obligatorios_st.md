## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-027 | Fecha de ejecución | 2026-11-16 16:15:18 |
| Nombre de la prueba | registro_usuario_campos_obligatorios_st | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Sistema / Validaciones de Registro | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | ST |
| Tipo de prueba | Validaciones / Sistema |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa el rechazo de peticiones POST /api/auth/register cuando carecen de campos obligatorios o presentan formato inválido. |
| Objetivo | Garantizar que no se permita el registro de usuarios con email vacío o sin contraseña, retornando código 400 o 422. |
| Precondiciones | Servicio de autenticación en línea. |
| Datos de prueba | Cuerpos con: email ausente, contraseña vacía |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar payload inválido: Sin campo email | HTTP 400 Bad Request o 422 Unprocessable Entity | HTTP 422 | ✓ |
| 2 | Enviar payload inválido: Formato de email incorrecto | HTTP 400 Bad Request o 422 Unprocessable Entity | HTTP 422 | ✓ |
| 3 | Enviar payload inválido: Contraseña vacía | HTTP 400 Bad Request o 422 Unprocessable Entity | HTTP 422 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-027_registro_usuario_campos_obligatorios_st_evidence.json](evidencias/usuario/CP-027_registro_usuario_campos_obligatorios_st_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El backend impone validaciones de integridad antes de persistir nuevos registros. |
