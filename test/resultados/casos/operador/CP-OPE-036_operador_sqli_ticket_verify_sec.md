## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-036 | Fecha de ejecución | 2026-11-16 16:15:00 |
| Nombre de la prueba | operador_sqli_ticket_verify_sec | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | SECURITY / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SECURITY |
| Tipo de prueba | Seguridad / Inyección SQL |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar inmunidad contra inyección SQL en parámetro ticketCode |
| Objetivo | Garantizar que payloads SQL no provoquen errores 500 ni bypass de acceso |
| Precondiciones | Payload SQLi |
| Datos de prueba | TKT-' OR '1'='1' -- |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar payload SQLi en verify | valid=False sin error 500 | HTTP 200, valid=False | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-036_operador_sqli_ticket_verify_sec_evidence.json](evidencias/operador/CP-OPE-036_operador_sqli_ticket_verify_sec_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
