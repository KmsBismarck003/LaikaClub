## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-017 | Fecha de ejecución | 2026-11-16 16:15:51 |
| Nombre de la prueba | flujo_mercancia_catalogo_publico_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Mercancía / Catálogo | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Tienda |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar consulta pública de detalle de artículo y catálogo de mercancía oficial |
| Objetivo | Comprobar disponibilidad de catálogo para compras en línea |
| Precondiciones | Servicio laika_merchandise activo |
| Datos de prueba | Item ID: 99 / Catálogo general |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar catálogo público /api/merchandise | HTTP 200 con listado | HTTP 200 (32 items) | ✓ |
| 2 | Consultar detalle de artículo 99 | HTTP 200 con atributos y variantes | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-017_flujo_mercancia_catalogo_publico_get_evidence.json](evidencias/avanzados/CP-ADV-017_flujo_mercancia_catalogo_publico_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Catálogo y artículo 99 consultados exitosamente (HTTP 200, 32 items) |
