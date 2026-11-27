## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-037 | Fecha de ejecución | 2026-11-16 16:15:34 |
| Nombre de la prueba | flujo_bigdata_ml_anomaly_detection_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Big Data / Detección Anomalías | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Machine Learning / Isolation Forest |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar detección de patrones de compra anómalos, bots y sospecha de reventa |
| Objetivo | Comprobar ejecución de algoritmo de Isolation Forest sobre transacciones |
| Precondiciones | Servicio laika_analytics_bigdata activo |
| Datos de prueba | Ruta: GET /api/analytics/ml/anomaly |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Ejecutar detección de anomalías | HTTP 200 con reporte o 404 controlado | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-037_flujo_bigdata_ml_anomaly_detection_get_evidence.json](evidencias/avanzados/CP-ADV-037_flujo_bigdata_ml_anomaly_detection_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Evaluación de anomalías y bots completada: HTTP 200 |
