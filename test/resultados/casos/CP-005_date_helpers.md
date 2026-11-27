## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-005 | Fecha de ejecución | 2026-11-16 12:56:57 |
| Nombre de la prueba | date_helpers | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Utilidades de Fecha Frontend | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UT |
| Tipo de prueba | Funcional |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa unitariamente la conversión de cadenas de fecha ISO a formato en español abreviado. |
| Objetivo | Garantizar que las fechas de eventos se muestren claras y amigables al comprador. |
| Precondiciones | Utilidades de fechas cargadas. |
| Datos de prueba | Fechas: '2026-11-20T19:00:00', '2026-12-31', '', 'Texto libre' |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Formatear fecha '2026-11-20T19:00:00' (Fecha ISO con hora) | 20 nov 2026 | 20 nov 2026 | ✓ |
| 2 | Formatear fecha '2026-12-31' (Fecha YYYY-MM-DD) | 31 dic 2026 | 31 dic 2026 | ✓ |
| 3 | Formatear fecha '' (Fecha vacía) | Fecha por definir | Fecha por definir | ✓ |
| 4 | Formatear fecha 'None' (Fecha nula) | Fecha por definir | Fecha por definir | ✓ |
| 5 | Formatear fecha 'Proximamente' (Fallback texto libre) | Proximamente | Proximamente | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-005_date_helpers_evidence.json](evidencias/CP-005_date_helpers_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Manejo robusto de fechas y formatos no estándar. |
