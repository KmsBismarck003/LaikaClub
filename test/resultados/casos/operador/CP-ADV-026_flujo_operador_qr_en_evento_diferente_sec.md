## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-026 | Fecha de ejecución | 2026-11-16 16:15:52 |
| Nombre de la prueba | flujo_operador_qr_en_evento_diferente_sec | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Operador / Control Puerta | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SECURITY |
| Tipo de prueba | Seguridad / Control de Acceso |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar rechazo de escaneo de boleto asignado a un evento en la puerta de otro evento |
| Objetivo | Impedir ingreso de asistentes con boletos de otros espectáculos |
| Precondiciones | Boleto TKT-C853F390 de Evento 100001 escaneado con selectedEventId=20 |
| Datos de prueba | selectedEventId: 20 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Escanear boleto de evento A en puerta de evento B | valid: false en respuesta | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-026_flujo_operador_qr_en_evento_diferente_sec_evidence.json](evidencias/operador/CP-ADV-026_flujo_operador_qr_en_evento_diferente_sec_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Acceso denegado: valid=False, statusCode=FUTURE_EVENT |
