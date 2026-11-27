## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-074 | Fecha de ejecución | 2026-11-16 12:56:21 |
| Nombre de la prueba | catalogo_mercancia_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Tienda de Mercancía Oficial | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa la obtención del catálogo completo de productos oficiales disponibles en la plataforma mediante GET /api/merchandise. |
| Objetivo | Garantizar que el servicio responda con código HTTP 200 y una lista de artículos con precios y variantes. |
| Precondiciones | Microservicio laika_merchandise en línea. |
| Datos de prueba | GET /api/merchandise |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar GET /api/merchandise al API Gateway | HTTP 200 OK con catálogo de productos | HTTP 200 | ✓ |
| 2 | Verificar que el cuerpo contenga una lista de artículos | Lista JSON devuelta | 32 artículos retornados | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-074_catalogo_mercancia_endpoint_get_evidence.json](evidencias/CP-074_catalogo_mercancia_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El servicio de comercio electrónico provee el inventario oficial a los usuarios. |
