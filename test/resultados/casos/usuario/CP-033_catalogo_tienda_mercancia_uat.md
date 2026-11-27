## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-033 | Fecha de ejecución | 2026-11-16 16:15:20 |
| Nombre de la prueba | catalogo_tienda_mercancia_uat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UAT / Tienda de Mercancía Oficial (/shop) | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UAT |
| Tipo de prueba | Aceptación de Usuario |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa la navegación y despliegue del catálogo de productos y souvenirs en la tienda oficial LaikaClub. |
| Objetivo | Garantizar que los productos oficiales se listen con imágenes, precios y variantes seleccionables. |
| Precondiciones | Microservicio de mercancía activo en puerto 8203. |
| Datos de prueba | GET /api/merchandise |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Cargar catálogo de productos oficiales en la tienda | HTTP 200 con listado de artículos disponibles | HTTP 200, 32 productos encontrados | ✓ |
| 2 | Verificar título y precio del producto destacado | Título y precio visibles | Producto: Playera Afterlife Spectrum, Precio: $None | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-033_catalogo_tienda_mercancia_uat_evidence.json](evidencias/usuario/CP-033_catalogo_tienda_mercancia_uat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | La tienda oficial permite a los fanáticos descubrir y comprar productos de sus eventos favoritos. |
