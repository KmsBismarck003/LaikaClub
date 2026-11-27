## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-054 | Fecha de ejecución | 2026-11-16 12:56:57 |
| Nombre de la prueba | validacion_formulario_perfil_usability | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Usabilidad / Formularios de Usuario | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | USABILITY |
| Tipo de prueba | Usabilidad |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa que el formulario de perfil maneje adecuadamente formatos comunes de número telefónico (con espacios, guiones o diez dígitos continuos). |
| Objetivo | Garantizar una experiencia de edición de perfil sin bloqueos injustificados en campos de contacto opcionales. |
| Precondiciones | Usuario autenticado con rol usuario. |
| Datos de prueba | Teléfono: '55 1234 5678' vs '5512345678' |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Actualizar teléfono con 10 dígitos estándar ('5512345678') | HTTP 200 OK | HTTP 200 | ✓ |
| 2 | Actualizar teléfono con guiones ('55-1234-5678') | HTTP 200 OK aceptando formato flexible | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-054_validacion_formulario_perfil_usability_evidence.json](evidencias/CP-054_validacion_formulario_perfil_usability_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El formulario tolera variaciones naturales en el ingreso de datos de contacto. |
