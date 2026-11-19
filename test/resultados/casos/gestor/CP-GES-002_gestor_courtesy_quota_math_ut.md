## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-002 | Fecha de ejecución | 2026-11-16 16:15:33 |
| Nombre de la prueba | gestor_courtesy_quota_math_ut | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UT / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UT |
| Tipo de prueba | Lógica / Cuotas |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar cálculo de cuota restante de cortesías |
| Objetivo | Verificar resta aritmética y control de desbordamiento |
| Precondiciones | Cuotas asignadas a gestor |
| Datos de prueba | max=50, issued=12 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Resta normal de cuota | 38 | 38 | ✓ |
| 2 | Excepción por emisión excedida | ValueError | Excepción capturada | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-002_gestor_courtesy_quota_math_ut_evidence.json](evidencias/gestor/CP-GES-002_gestor_courtesy_quota_math_ut_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
