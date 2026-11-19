## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-030 | Fecha de ejecución | 2026-11-16 16:15:30 |
| Nombre de la prueba | actualizacion_datos_personales_uat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UAT / Gestión de Perfil de Usuario | Ambiente | QA / Docker Live Services |
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
| Descripción | Evalúa la experiencia del usuario al acceder a 'Mi Perfil' y actualizar sus nombres, apellidos y teléfono de contacto. |
| Objetivo | Garantizar que el formulario de perfil acepte la modificación y notifique el éxito con datos actualizados. |
| Precondiciones | Usuario autenticado en la plataforma. |
| Datos de prueba | Nuevos datos: First='Usuario UAT', Last='Final', Phone='5553334444' |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Acceder a la pantalla de 'Mi Perfil' | Información de cuenta visualizada | HTTP 200 | ✓ |
| 2 | Enviar modificaciones en el formulario | Cambios guardados con éxito | HTTP 200 | ✓ |
| 3 | Recargar perfil para validar persistencia de los cambios | Datos coincidentes con los ingresados | Nombre: Usuario UAT, Tel: 5553334444 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-030_actualizacion_datos_personales_uat_evidence.json](evidencias/usuario/CP-030_actualizacion_datos_personales_uat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El usuario puede gestionar su información personal de manera transparente e inmediata. |
