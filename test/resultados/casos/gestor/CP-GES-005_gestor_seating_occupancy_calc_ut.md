## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-005 | Fecha de ejecución | 2026-11-16 16:15:33 |
| Nombre de la prueba | gestor_seating_occupancy_calc_ut | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UT / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UT |
| Tipo de prueba | Lógica / Aforo |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar cálculo de ocupación porcentual de aforo |
| Objetivo | Verificar precisión en porcentaje de asistencia en salas |
| Precondiciones | Aforo total y boletos vendidos |
| Datos de prueba | cap=50000, sold=4 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Ocupación de 4 sobre 50,000 | 0.01% | 0.01% | ✓ |
| 2 | Ocupación de 500 sobre 1,000 | 50.0% | 50.0% | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-005_gestor_seating_occupancy_calc_ut_evidence.json](evidencias/gestor/CP-GES-005_gestor_seating_occupancy_calc_ut_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
