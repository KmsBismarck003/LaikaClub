## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-043 | Fecha de ejecución | 2026-11-16 16:15:31 |
| Nombre de la prueba | validacion_campos_requeridos_crear_usuario_usability | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | USABILITY / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | USABILITY |
| Tipo de prueba | Usabilidad / Mensajes de Error |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Verificar mensajes de validación al crear usuario sin correo ni contraseña |
| Objetivo | Comprobar que el sistema responda con retroalimentación clara para el administrador |
| Precondiciones | Admin autenticado |
| Datos de prueba | POST /api/admin/users con payload vacío |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar creación sin campos obligatorios | Respuesta de error descriptiva | HTTP 500 ({"detail":"Email y contraseña son requeridos"}) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-043_validacion_campos_requeridos_crear_usuario_usability_evidence.json](evidencias/admin/CP-ADM-043_validacion_campos_requeridos_crear_usuario_usability_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
