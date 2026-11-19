## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-033 | Fecha de ejecución | 2026-11-16 16:15:47 |
| Nombre de la prueba | flujo_bigdata_tables_catalogo_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Big Data / Catálogo | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Big Data / Motor Spark |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar consulta de catálogo de tablas disponibles en el motor de analítica Big Data |
| Objetivo | Comprobar disponibilidad de tablas distribuidas (tickets, users, payments, events) |
| Precondiciones | Servicio laika_analytics_bigdata activo |
| Datos de prueba | Ruta: GET /api/analytics/tables |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar tablas Big Data | HTTP 200 con listado de tablas | HTTP 200 (4 tablas) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-033_flujo_bigdata_tables_catalogo_get_evidence.json](evidencias/avanzados/CP-ADV-033_flujo_bigdata_tables_catalogo_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Tablas de Big Data disponibles: ['tickets', 'users', 'payments', 'events'] |
