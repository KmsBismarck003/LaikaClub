## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-011 | Fecha de ejecución | 2026-11-16 16:15:54 |
| Nombre de la prueba | flujo_transferencia_recipient_vacio_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Transferencias / Validación | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Validación / REST |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar validación de entrada: rechazo al enviar solicitud de transferencia sin recipient_email |
| Objetivo | Garantizar que el campo recipient_email sea obligatorio |
| Precondiciones | Servicio laika_tickets activo; usuario autenticado |
| Datos de prueba | recipient_email: '' |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar transferencia sin correo | HTTP 400 Bad Request | HTTP 400 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-011_flujo_transferencia_recipient_vacio_post_evidence.json](evidencias/avanzados/CP-ADV-011_flujo_transferencia_recipient_vacio_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Rechazo validado: {"timestamp":"2026-11-16T22:15:54.508+00:00","status":400,"error":"Bad Request", |
