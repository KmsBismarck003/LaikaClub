## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-048 | Fecha de ejecución | 2026-11-16 16:15:50 |
| Nombre de la prueba | flujo_cortesia_canje_duplicado_rechazo_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Cortesías / Integridad Canje | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Integridad / Reclamación |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar rechazo controlado ante intento de canje de un código de cortesía ya utilizado |
| Objetivo | Garantizar que un token de cortesía no pueda ser reutilizado por múltiples usuarios |
| Precondiciones | Servicio laika_tickets activo; credenciales usuario |
| Datos de prueba | Ruta: POST /api/tickets/courtesy/claim con token ya canjeado |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Reintentar canje de token ya utilizado | HTTP 400/409 Rechazo | HTTP 400 (El boleto no se encuentra en estado canjeable (estado: unutilized)) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-048_flujo_cortesia_canje_duplicado_rechazo_post_evidence.json](evidencias/avanzados/CP-ADV-048_flujo_cortesia_canje_duplicado_rechazo_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Prevención de doble canje confirmada: HTTP 409 Conflict |
