## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-037 | Fecha de ejecución | 2026-11-16 16:14:16 |
| Nombre de la prueba | operador_handheld_scanners_ct | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | CT / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | CT |
| Tipo de prueba | Compatibilidad / Dispositivos |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar compatibilidad con terminales portátiles y lectores industriales |
| Objetivo | Garantizar HTTP 200 ante peticiones desde Zebra, Honeywell, Mobile Safari y Chrome Android |
| Precondiciones | User-Agents representativos de lectores ópticos |
| Datos de prueba | Zebra, Honeywell, Mobile |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Petición desde Zebra Scanner | HTTP 200 | HTTP 200 | ✓ |
| 2 | Petición desde Honeywell EDA51 | HTTP 200 | HTTP 200 | ✓ |
| 3 | Petición desde Mobile Safari | HTTP 200 | HTTP 200 | ✓ |
| 4 | Petición desde Chrome Android | HTTP 200 | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-037_operador_handheld_scanners_ct_evidence.json](evidencias/operador/CP-OPE-037_operador_handheld_scanners_ct_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
