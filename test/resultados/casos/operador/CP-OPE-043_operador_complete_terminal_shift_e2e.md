## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-043 | Fecha de ejecución | 2026-11-16 16:14:25 |
| Nombre de la prueba | operador_complete_terminal_shift_e2e | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | E2E / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | E2E |
| Tipo de prueba | End-to-End / Flujo Completo |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Ejecutar turno operativo completo del Operador en terminal de acceso |
| Objetivo | Login -> Métricas Staff -> Escaneo Válido -> Escaneo Inválido -> Consulta Historial -> Logout |
| Precondiciones | Credenciales oficiales de Operador |
| Datos de prueba | Turno operativo interactivo completo |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Iniciar sesión como Operador | HTTP 200 con JWT | HTTP 200 | ✓ |
| 2 | Consultar métricas de staff | HTTP 200 | HTTP 200 | ✓ |
| 3 | Escanear boleto registrado | HTTP 200 con estado | HTTP 200 | ✓ |
| 4 | Escanear boleto apócrifo | HTTP 200 con INVALID_CODE | HTTP 200 | ✓ |
| 5 | Auditar bitácora de turno | HTTP 200 con logs | HTTP 200, total=228 | ✓ |
| 6 | Cerrar sesión de Operador | HTTP 200/204 | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-043_operador_complete_terminal_shift_e2e_evidence.json](evidencias/operador/CP-OPE-043_operador_complete_terminal_shift_e2e_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
