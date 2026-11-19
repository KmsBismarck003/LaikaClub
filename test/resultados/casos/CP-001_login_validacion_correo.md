## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-001 | Fecha de ejecución | 2026-11-16 12:56:57 |
| Nombre de la prueba | login_validacion_correo | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Autenticación / Login Frontend | Ambiente | QA / Docker Live Services |
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
| Descripción | Evalúa unitariamente la función de validación sintáctica de direcciones de correo electrónico en formularios. |
| Objetivo | Garantizar que solo correos con formato válido sean aceptados y se rechacen cadenas mal formadas. |
| Precondiciones | Módulo de utilidades de validación disponible. |
| Datos de prueba | Correos válidos: usuario@dominio.com, test.sub@laika.com; Inválidos: sin_arroba, @sin_usuario.com, usuario@.com |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Validar formato de 'usuario@laikaclub.com' (Correo estándar) | Es válido: True | Es válido: True | ✓ |
| 2 | Validar formato de 'arturo.vela+test@gmail.com' (Correo con signo más y punto) | Es válido: True | Es válido: True | ✓ |
| 3 | Validar formato de 'sin_arroba.com' (Falta arroba) | Es válido: False | Es válido: False | ✓ |
| 4 | Validar formato de '@sin_usuario.com' (Falta usuario local) | Es válido: False | Es válido: False | ✓ |
| 5 | Validar formato de 'usuario@sin_dominio' (Falta TLD de dominio) | Es válido: False | Es válido: False | ✓ |
| 6 | Validar formato de '' (Cadena vacía) | Es válido: False | Es válido: False | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-001_login_validacion_correo_evidence.json](evidencias/CP-001_login_validacion_correo_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Validador regex operó conforme a especificación RFC 5322 simplificada. |
