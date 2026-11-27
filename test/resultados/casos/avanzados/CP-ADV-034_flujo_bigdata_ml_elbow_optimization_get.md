## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-034 | Fecha de ejecución | 2026-11-16 16:15:35 |
| Nombre de la prueba | flujo_bigdata_ml_elbow_optimization_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Big Data / Machine Learning | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Machine Learning / Clustering |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar optimización de clustering mediante el Método del Codo (Elbow Method) |
| Objetivo | Comprobar cálculo de distorsión y sugerencia de k óptimo para segmentación de usuarios |
| Precondiciones | Servicio laika_analytics_bigdata activo |
| Datos de prueba | Ruta: GET /api/analytics/ml/elbow?max_k=4 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Ejecutar Método del Codo (Elbow) | HTTP 200 con curvas de inercia/distorsión | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-034_flujo_bigdata_ml_elbow_optimization_get_evidence.json](evidencias/avanzados/CP-ADV-034_flujo_bigdata_ml_elbow_optimization_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Optimización de clústeres mediante Método del Codo calculada con éxito |
