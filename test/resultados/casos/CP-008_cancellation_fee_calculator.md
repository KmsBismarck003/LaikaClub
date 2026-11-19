## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-008 | Fecha de ejecución | 2026-11-16 12:56:57 |
| Nombre de la prueba | cancellation_fee_calculator | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Tickets / Cancelaciones Backend | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UT |
| Tipo de prueba | Reglas de negocio |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa las reglas de elegibilidad y plazos de anticipación para cancelaciones de boletos. |
| Objetivo | Verificar que solo boletos activos con más de 24 horas previas al evento obtengan cotización de reembolso positiva. |
| Precondiciones | Algoritmo de cotización implementado conforme a CancellationServiceImpl. |
| Datos de prueba | Estados: active, used, refunded; Antelaciones: 48h, 12h, -2h |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Evaluar escenario: Boleto activo a 48h del evento | Elegible=True, Reembolso=$500.00 | Elegible=True, Reembolso=$500.00 (Reembolso del 100% aprobado.) | ✓ |
| 2 | Evaluar escenario: Boleto ya utilizado | Elegible=False, Reembolso=$0.00 | Elegible=False, Reembolso=$0.00 (El boleto ya ha sido canjeado o utilizado para ingresar al evento.) | ✓ |
| 3 | Evaluar escenario: Boleto a 12h del evento (menos de 24h) | Elegible=False, Reembolso=$0.00 | Elegible=False, Reembolso=$0.00 (Cancelación extemporánea: se requiere al menos 24 horas de antelación.) | ✓ |
| 4 | Evaluar escenario: Evento en el pasado | Elegible=False, Reembolso=$0.00 | Elegible=False, Reembolso=$0.00 (El evento ya concluyó o dio inicio.) | ✓ |
| 5 | Evaluar escenario: Boleto de cortesía gratuito | Elegible=True, Reembolso=$0.00 | Elegible=True, Reembolso=$0.00 (Cancelación de cortesía sin dispersión monetaria.) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-008_cancellation_fee_calculator_evidence.json](evidencias/CP-008_cancellation_fee_calculator_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Todas las reglas de antelación y estados de boleto fueron verificadas exitosamente. |
