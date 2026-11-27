## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-020 | Fecha de ejecución | 2026-11-16 16:15:30 |
| Nombre de la prueba | operador_ticket_verification_uat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UAT / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UAT |
| Tipo de prueba | Aceptación / Control de Acceso |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar experiencia de escaneo y verificación de boleto legítimo |
| Objetivo | Validar respuesta estructurada con titular, zona y mensaje operativo |
| Precondiciones | Boleto TKT-C853F390 |
| Datos de prueba | POST /api/tickets/verify |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Verificar boleto legítimo | HTTP 200 con statusTitle y operatorMessage | HTTP 200, title='EVENTO PRÓXIMO / PUERTAS CERRADAS' | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-020_operador_ticket_verification_uat_evidence.json](evidencias/operador/CP-OPE-020_operador_ticket_verification_uat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
