## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-011 | Fecha de ejecución | 2026-11-16 16:15:15 |
| Nombre de la prueba | operador_gateway_staff_verify_sit | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | SIT / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SIT |
| Tipo de prueba | Integración de Sistema |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar enrutamiento Gateway -> Tickets Service (/api/staff/verify) |
| Objetivo | Verificar ruta oficial de terminal staff para escaneo en puerta |
| Precondiciones | Terminal de acceso staff |
| Datos de prueba | POST /api/staff/verify |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Petición /api/staff/verify | HTTP 200 con respuesta estructurada | HTTP 200, status=FUTURE_EVENT | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-011_operador_gateway_staff_verify_sit_evidence.json](evidencias/operador/CP-OPE-011_operador_gateway_staff_verify_sit_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
