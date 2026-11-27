## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-046 | Fecha de ejecución | 2026-11-16 16:15:50 |
| Nombre de la prueba | flujo_cortesia_emision_directa_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Cortesías / Emisión | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Gestor |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar emisión oficial de boletos de cortesía por gestor para invitados y prensa |
| Objetivo | Comprobar asignación de precio cero ($0.0) y generación de lote de tokens de canje |
| Precondiciones | Servicio laika_tickets activo; credenciales gestor |
| Datos de prueba | Ruta: POST /api/tickets/courtesy/issue |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Emitir cortesía para patrocinador | HTTP 200 con claim_token generado | HTTP 200 (Token: LAIKA-COR-492A8C) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-046_flujo_cortesia_emision_directa_post_evidence.json](evidencias/avanzados/CP-ADV-046_flujo_cortesia_emision_directa_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Cortesía emitida con éxito (Token: LAIKA-COR-492A8C, Boleto: TKT-COR-67FAE723) |
