## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-029 | Fecha de ejecución | 2026-11-16 16:15:52 |
| Nombre de la prueba | flujo_operador_ticket_transferido_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Operador / Trazabilidad | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Auditoría |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar auditoría de boletos transferidos en el punto de control de acceso staff |
| Objetivo | Comprobar consulta de historial de auditoría de boletos transferidos |
| Precondiciones | Servicio laika_tickets activo |
| Datos de prueba | Ticket: TKT-C853F390 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar bitácora de auditoría del boleto | HTTP 200 OK con array de logs | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-029_flujo_operador_ticket_transferido_post_evidence.json](evidencias/operador/CP-ADV-029_flujo_operador_ticket_transferido_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Auditoría obtenida: 106 registros de escaneo registrados |
