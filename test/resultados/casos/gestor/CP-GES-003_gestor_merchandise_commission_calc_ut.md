## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-003 | Fecha de ejecución | 2026-11-16 16:15:33 |
| Nombre de la prueba | gestor_merchandise_commission_calc_ut | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UT / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UT |
| Tipo de prueba | Lógica / Finanzas |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar deducción de comisión de mercancía oficial |
| Objetivo | Comprobar cálculo de comisión del 10% y neto para gestor |
| Precondiciones | Precio unitario de gorra/playera |
| Datos de prueba | price=299.0, pct=10.0 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Calcular comisión 10% sobre 299.0 | comm=29.9, net=269.1 | comm=29.9, net=269.1 | ✓ |
| 2 | Calcular comisión 15% sobre 1000.0 | comm=150.0, net=850.0 | comm=150.0, net=850.0 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-003_gestor_merchandise_commission_calc_ut_evidence.json](evidencias/gestor/CP-GES-003_gestor_merchandise_commission_calc_ut_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
