## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-018 | Fecha de ejecución | 2026-11-16 16:15:16 |
| Nombre de la prueba | gestor_revenue_consistency_st | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | ST / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | ST |
| Tipo de prueba | Integridad / Negocio |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evaluar consistencia matemática entre boletos vendidos e ingresos brutos |
| Objetivo | Comprobar que gross_revenue >= 0 y coincide con conteo transaccional |
| Precondiciones | Evento 100001 |
| Datos de prueba | GET /api/manager/events/100001/revenue |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Verificar consistencia no negativa | gross >= 0 y sold >= 0 | gross=7200.0, sold=4 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-018_gestor_revenue_consistency_st_evidence.json](evidencias/gestor/CP-GES-018_gestor_revenue_consistency_st_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
