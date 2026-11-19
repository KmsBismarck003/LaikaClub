## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-006 | Fecha de ejecución | 2026-11-16 16:15:48 |
| Nombre de la prueba | flujo_reembolso_politica_evento_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Reembolsos / Políticas | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Contrato |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar consulta de políticas de reembolso aplicables a un evento activo |
| Objetivo | Comprobar transparencia de condiciones de cancelación para el consumidor |
| Precondiciones | Servicio laika_tickets activo |
| Datos de prueba | Evento ID: 100001 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar política de reembolso | HTTP 200 OK con eligible y refundPercentage | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-006_flujo_reembolso_politica_evento_get_evidence.json](evidencias/avanzados/CP-ADV-006_flujo_reembolso_politica_evento_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Política: eligible=True, porcentaje=100% |
