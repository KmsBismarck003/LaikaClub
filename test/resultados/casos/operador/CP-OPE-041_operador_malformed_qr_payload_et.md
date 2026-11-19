## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-041 | Fecha de ejecución | 2026-11-16 16:14:27 |
| Nombre de la prueba | operador_malformed_qr_payload_et | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | ET / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | ET |
| Tipo de prueba | Exploratorio / Resiliencia |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Explorar comportamiento ante lectura óptica con caracteres malformados |
| Objetivo | Garantizar que secuencias de control o caracteres no imprimibles no provoquen crash |
| Precondiciones | Payload corrupto |
| Datos de prueba | TKT-!@#$%^&*()_+{}[]:;<>,.?/ |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar código con caracteres corruptos | Manejo controlado (HTTP 200 con INVALID_CODE o 400) | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-041_operador_malformed_qr_payload_et_evidence.json](evidencias/operador/CP-OPE-041_operador_malformed_qr_payload_et_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
