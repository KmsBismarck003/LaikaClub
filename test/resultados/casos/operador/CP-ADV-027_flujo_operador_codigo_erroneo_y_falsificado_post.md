## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-027 | Fecha de ejecución | 2026-11-16 16:15:52 |
| Nombre de la prueba | flujo_operador_codigo_erroneo_y_falsificado_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Operador / Validación | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Detección Fraude |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar respuesta de terminal staff ante escaneo de código QR dañado o falsificado |
| Objetivo | Garantizar que la terminal devuelva INVALID_CODE con mensaje claro al operador |
| Precondiciones | Servicio laika_tickets activo; token de operador |
| Datos de prueba | Ticket: TKT-FAKE-FORGED-999 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Escanear boleto falsificado | statusCode: INVALID_CODE | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-027_flujo_operador_codigo_erroneo_y_falsificado_post_evidence.json](evidencias/operador/CP-ADV-027_flujo_operador_codigo_erroneo_y_falsificado_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Código falsificado rechazado con statusCode=INVALID_CODE |
