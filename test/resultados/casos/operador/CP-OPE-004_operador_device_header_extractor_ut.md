## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-004 | Fecha de ejecución | 2026-11-16 16:15:34 |
| Nombre de la prueba | operador_device_header_extractor_ut | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UT / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UT |
| Tipo de prueba | Lógica / Dispositivos |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar clasificación del dispositivo de escaneo según cabecera User-Agent |
| Objetivo | Garantizar identificación de escáner industrial vs terminal móvil vs estación |
| Precondiciones | User-Agent de hardware |
| Datos de prueba | Zebra TC26 Android vs Chrome Desktop |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Identificar terminal Zebra | HARDWARE_SCANNER | HARDWARE_SCANNER | ✓ |
| 2 | Identificar terminal de escritorio | DESKTOP_STATION | DESKTOP_STATION | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-004_operador_device_header_extractor_ut_evidence.json](evidencias/operador/CP-OPE-004_operador_device_header_extractor_ut_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
