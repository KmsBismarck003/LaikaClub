## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-028 | Fecha de ejecución | 2026-11-16 16:15:52 |
| Nombre de la prueba | flujo_operador_canje_duplicado_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Operador / Reingreso | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Seguridad / Control de Acceso |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar control de reingreso: prevenir segundo canje de un boleto |
| Objetivo | Garantizar que no se permita ingreso múltiple con un único boleto |
| Precondiciones | Servicio laika_tickets activo; credenciales de operador |
| Datos de prueba | Ticket: TKT-INVALIDO-999 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Escanear código para verificación de estado | valid: false | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-028_flujo_operador_canje_duplicado_post_evidence.json](evidencias/operador/CP-ADV-028_flujo_operador_canje_duplicado_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Control de acceso denegado correctamente: valid=False |
