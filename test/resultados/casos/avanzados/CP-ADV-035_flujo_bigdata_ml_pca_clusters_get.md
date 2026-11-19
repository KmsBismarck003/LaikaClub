## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-035 | Fecha de ejecución | 2026-11-16 16:15:41 |
| Nombre de la prueba | flujo_bigdata_ml_pca_clusters_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Big Data / Machine Learning | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Machine Learning / Reducción Dimensional |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar reducción de dimensionalidad con PCA y segmentación K-Means |
| Objetivo | Comprobar cálculo de varianza explicada y proyección factorial de eventos y usuarios |
| Precondiciones | Servicio laika_analytics_bigdata activo |
| Datos de prueba | Ruta: GET /api/analytics/ml/pca?k=3 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Ejecutar Análisis PCA + K-Means | HTTP 200 con componentes y varianza | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-035_flujo_bigdata_ml_pca_clusters_get_evidence.json](evidencias/avanzados/CP-ADV-035_flujo_bigdata_ml_pca_clusters_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Proyección factorial y varianza explicada generadas correctamente |
