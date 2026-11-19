## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-013 | Fecha de ejecución | 2026-11-16 16:15:54 |
| Nombre de la prueba | flujo_transferencia_incoming_list_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Transferencias / Listado | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Bandeja |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar contrato de respuesta al consultar transferencias entrantes pendientes del usuario |
| Objetivo | Comprobar bandeja de boletos transferidos pendientes de aceptación |
| Precondiciones | Servicio laika_tickets activo; usuario autenticado |
| Datos de prueba | N/A |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar transferencias entrantes | HTTP 200 OK con array JSON | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-013_flujo_transferencia_incoming_list_get_evidence.json](evidencias/avanzados/CP-ADV-013_flujo_transferencia_incoming_list_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | 200 OK obtenido con 0 transferencias entrantes |
