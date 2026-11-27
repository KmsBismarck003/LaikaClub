## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-007 | Fecha de ejecución | 2026-11-16 16:15:48 |
| Nombre de la prueba | flujo_reembolso_cotizacion_ticket_propio_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Reembolsos / Cotización | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Cotización |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar cotización previa de reembolso para boleto propio del usuario autenticado |
| Objetivo | Garantizar que el usuario conozca el importe neto antes de confirmar cancelación |
| Precondiciones | Boleto 200265 perteneciente al usuario de pruebas |
| Datos de prueba | Ticket ID: 200265 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Cotizar cancelación de boleto propio | HTTP 200 OK con desglose financiero | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-007_flujo_reembolso_cotizacion_ticket_propio_get_evidence.json](evidencias/avanzados/CP-ADV-007_flujo_reembolso_cotizacion_ticket_propio_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Cotización obtenida exitosamente para ticket 200265 |
