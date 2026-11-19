## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-046 | Fecha de ejecución | 2026-11-16 16:14:26 |
| Nombre de la prueba | gestor_extreme_pagination_transactions_et | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | ET / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | ET |
| Tipo de prueba | Exploratorio / Paginación |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Explorar límites de paginación extrema en transacciones de gestor |
| Objetivo | Evaluar comportamiento con limit=0 y limit=1000000 |
| Precondiciones | Valores extremos de parámetro limit |
| Datos de prueba | limit=0, limit=1000000 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Probar limit=0 | Manejo controlado | HTTP 200 | ✓ |
| 2 | Probar limit=1000000 | Manejo controlado | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-046_gestor_extreme_pagination_transactions_et_evidence.json](evidencias/gestor/CP-GES-046_gestor_extreme_pagination_transactions_et_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
