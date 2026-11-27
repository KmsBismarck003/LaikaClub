## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-047 | Fecha de ejecución | 2026-11-16 16:15:50 |
| Nombre de la prueba | flujo_cortesia_token_validacion_previa_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Cortesías / Validación | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Centro de Canje |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar previsualización y verificación pública de tokens de cortesía antes del canje |
| Objetivo | Comprobar retorno de detalles del evento, función, recinto y estado 'pending_claim' |
| Precondiciones | Servicio laika_tickets activo |
| Datos de prueba | Ruta: GET /api/tickets/courtesy/validate-token/LAIKA-COR-905D1C |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Previsualizar token de cortesía | HTTP 200 con datos de evento | HTTP 200 (Cine Club: Joyas de la Animación) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-047_flujo_cortesia_token_validacion_previa_get_evidence.json](evidencias/avanzados/CP-ADV-047_flujo_cortesia_token_validacion_previa_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Token verificado correctamente: evento 'Cine Club: Joyas de la Animación', estado: unutilized |
