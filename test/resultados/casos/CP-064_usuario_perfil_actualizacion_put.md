## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-064 | Fecha de ejecución | 2026-11-16 12:56:31 |
| Nombre de la prueba | usuario_perfil_actualizacion_put | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Perfil de Usuario | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa la modificación del nombre, apellido y teléfono del usuario autenticado mediante PUT /api/auth/users/me. |
| Objetivo | Verificar que el servicio retorne HTTP 200 con el DTO actualizado reflejando los nuevos valores enviados. |
| Precondiciones | Token JWT Bearer válido. |
| Datos de prueba | Nombres: 'QA_Automated', Apellidos: 'Unit_Check', Tel: '5554443322' |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar PUT /api/auth/users/me con nuevos datos | HTTP 200 OK con perfil modificado | HTTP 200 | ✓ |
| 2 | Verificar datos modificados en el DTO de respuesta | firstName='QA_Automated', phone='5554443322' | firstName='QA_Automated', phone='5554443322' | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-064_usuario_perfil_actualizacion_put_evidence.json](evidencias/CP-064_usuario_perfil_actualizacion_put_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El servicio actualiza los campos permitidos y retorna el objeto sincronizado. |
