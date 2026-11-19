## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-003 | Fecha de ejecución | 2026-11-16 16:15:34 |
| Nombre de la prueba | operador_flow_rate_calc_ut | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UT / Operador | Ambiente | QA / Docker Live Services |
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
| Descripción | Validar cálculo de flujo de ingreso por minuto en torniquete |
| Objetivo | Comprobar división de aforo ingresado entre minutos transcurridos |
| Precondiciones | Aforo en puerta y tiempo de turno |
| Datos de prueba | entries=600, minutes=30 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Calcular 600 ingresos en 30 min | 20.0 personas/min | 20.0 personas/min | ✓ |
| 2 | Calcular 150 ingresos en 45 min | 3.33 personas/min | 3.33 personas/min | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-003_operador_flow_rate_calc_ut_evidence.json](evidencias/operador/CP-OPE-003_operador_flow_rate_calc_ut_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
