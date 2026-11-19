## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-042 | Fecha de ejecución | 2026-11-16 12:56:42 |
| Nombre de la prueba | latencia_catalogo_eventos_pt | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Rendimiento / Latencia de Catálogo | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | PT |
| Tipo de prueba | Rendimiento |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Mide el tiempo de respuesta promedio (SLA < 500ms) al consultar la cartelera de eventos públicos mediante GET /api/events/public. |
| Objetivo | Garantizar que la experiencia de navegación del usuario sea fluida y de baja latencia. |
| Precondiciones | Servicios en vivo bajo carga normal. |
| Datos de prueba | Muestra de 10 peticiones consecutivas con limit=20 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Ejecutar 10 consultas consecutivas de eventos | 10 respuestas HTTP 200 | 10/10 completadas | ✓ |
| 2 | Evaluar latencia promedio contra el umbral de SLA (500 ms) | Tiempo promedio < 500 ms | Promedio: 19.10 ms (Min: 8.25 ms, Max: 31.90 ms) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-042_latencia_catalogo_eventos_pt_evidence.json](evidencias/CP-042_latencia_catalogo_eventos_pt_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El endpoint de eventos cumple holgadamente con los requerimientos de velocidad. |
