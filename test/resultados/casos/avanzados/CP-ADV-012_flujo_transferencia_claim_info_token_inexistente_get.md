## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-012 | Fecha de ejecución | 2026-11-16 16:15:54 |
| Nombre de la prueba | flujo_transferencia_claim_info_token_inexistente_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Transferencias / Reclamo | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Integridad / Negativo |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar consulta pública de reclamo de boleto transferido ante token falso o inexistente |
| Objetivo | Garantizar que tokens de transferencia inexistentes no expongan datos |
| Precondiciones | Servicio laika_tickets activo |
| Datos de prueba | Token: CLAIM-FAKE-TOKEN-999 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar claim-info con token espurio | Manejo seguro sin crash | HTTP 404 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-012_flujo_transferencia_claim_info_token_inexistente_get_evidence.json](evidencias/avanzados/CP-ADV-012_flujo_transferencia_claim_info_token_inexistente_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Manejo seguro de claim-info falso: HTTP 404 |
