## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-010 | Fecha de ejecución | 2026-11-16 16:15:54 |
| Nombre de la prueba | flujo_transferencia_a_si_mismo_rechazo_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Transferencias / Reglas | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Reglas de Negocio / Anti-Fraude |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar regla anti-fraude: rechazo estricto al intentar transferir un boleto al propio correo |
| Objetivo | Garantizar que una transferencia requiera un destinatario distinto al remitente |
| Precondiciones | Usuario qa_user_test@laikaclub.com con boleto 200265 |
| Datos de prueba | Destinatario: mismo email |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Solicitar transferencia hacia uno mismo | HTTP 400 'No puedes transferirte un boleto a ti mismo' | HTTP 400 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-010_flujo_transferencia_a_si_mismo_rechazo_post_evidence.json](evidencias/avanzados/CP-ADV-010_flujo_transferencia_a_si_mismo_rechazo_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Auto-transferencia rechazada con éxito: {"timestamp":"2026-11-16T22:15:54.290+00:00","status":400,"error":"Bad Request", |
