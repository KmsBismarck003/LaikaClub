## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-036 | Fecha de ejecución | 2026-11-16 16:15:47 |
| Nombre de la prueba | flujo_bigdata_ml_prospecting_leads_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Big Data / Prospección | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Inteligencia de Negocio / Leads |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar modelo predictivo de prospección de recintos y plazas de eventos |
| Objetivo | Comprobar generación de leads potenciales basados en demanda insatisfecha |
| Precondiciones | Servicio laika_analytics_bigdata activo |
| Datos de prueba | Ruta: GET /api/analytics/ml/prospecting |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar leads de prospección | HTTP 200 con ranking de recintos | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-036_flujo_bigdata_ml_prospecting_leads_get_evidence.json](evidencias/avanzados/CP-ADV-036_flujo_bigdata_ml_prospecting_leads_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Modelo de prospección de recintos consultado exitosamente |
