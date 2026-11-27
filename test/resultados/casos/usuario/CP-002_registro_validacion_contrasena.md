## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-002 | Fecha de ejecución | 2026-11-16 16:15:33 |
| Nombre de la prueba | registro_validacion_contrasena | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Registro / Seguridad Frontend | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UT |
| Tipo de prueba | Funcional |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa unitariamente la regla de longitud mínima y no vaciedad de contraseñas en el formulario de registro. |
| Objetivo | Verificar que el validador rechace contraseñas inferiores a 6 caracteres o vacías. |
| Precondiciones | Componente o utilidad de validación cargada. |
| Datos de prueba | Contraseñas: '', '12345', 'Pass12', 'TestQA123!' |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Validar entrada de contraseña '' (Contraseña vacía) | Válido: False | Válido: False - La contraseña debe tener al menos 6 caracteres | ✓ |
| 2 | Validar entrada de contraseña '12345' (5 caracteres (inferior al mínimo)) | Válido: False | Válido: False - La contraseña debe tener al menos 6 caracteres | ✓ |
| 3 | Validar entrada de contraseña 'Pass12' (6 caracteres (límite inferior válido)) | Válido: True | Válido: True - Contraseña válida | ✓ |
| 4 | Validar entrada de contraseña 'TestQA123!' (Compleja y válida) | Válido: True | Válido: True - Contraseña válida | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-002_registro_validacion_contrasena_evidence.json](evidencias/usuario/CP-002_registro_validacion_contrasena_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Cumple con la política de contraseña mínima del sistema. |
