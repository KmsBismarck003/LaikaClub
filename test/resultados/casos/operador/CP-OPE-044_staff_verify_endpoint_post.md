## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-044 | Fecha de ejecución | 2026-11-16 16:14:13 |
| Nombre de la prueba | staff_verify_endpoint_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / REST |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar que POST /api/staff/verify responda 200 OK con payload estructurado de validación de ticket. |
| Objetivo | Comprobar contrato de respuesta de verificación para terminales de control de acceso |
| Precondiciones | Servicio laika_tickets y gateway activos; token de operador. |
| Datos de prueba | Ticket: TKT-C853F390 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar POST /api/staff/verify | HTTP 200 OK | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-044_staff_verify_endpoint_post_evidence.json](evidencias/operador/CP-OPE-044_staff_verify_endpoint_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | 200 OK verificado, statusCode=FUTURE_EVENT |
