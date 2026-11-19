## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-025 | Fecha de ejecución | 2026-11-16 16:15:16 |
| Nombre de la prueba | catalogo_eventos_filtro_categoria_st | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Sistema / Catálogo de Eventos | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | ST |
| Tipo de prueba | Funcional / Sistema |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa el filtrado dinámico de eventos en el catálogo público usando el parámetro de consulta ?category= |
| Objetivo | Garantizar que al solicitar una categoría específica (ej. 'concert', 'theater'), todos los eventos retornados pertenezcan a dicha categoría. |
| Precondiciones | Eventos publicados con distintas categorías existentes en la base de datos. |
| Datos de prueba | Categorías probadas: 'concert', 'theater' |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Filtrar eventos por categoría 'concert' | HTTP 200 y todos los eventos con category='concert' | HTTP 200, 2 eventos (2 coincidentes) | ✓ |
| 2 | Filtrar eventos por categoría 'theater' | HTTP 200 y todos los eventos con category='theater' | HTTP 200, 0 eventos (0 coincidentes) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-025_catalogo_eventos_filtro_categoria_st_evidence.json](evidencias/usuario/CP-025_catalogo_eventos_filtro_categoria_st_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El motor de búsqueda y filtrado de eventos opera consistentemente. |
