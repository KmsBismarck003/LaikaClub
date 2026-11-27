## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-031 | Fecha de ejecución | 2026-11-16 16:14:51 |
| Nombre de la prueba | gestor_stats_schema_contract_rt | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | RT / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | RT |
| Tipo de prueba | Regresión / Contrato |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar estabilidad del contrato de métricas del gestor |
| Objetivo | Verificar que /api/stats/manager/dashboard contenga revenue, tickets y categories |
| Precondiciones | Petición de analítica |
| Datos de prueba | GET /api/stats/manager/dashboard |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Validar contrato de estadísticas | Campos requeridos presentes | HTTP 200, match=True | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-031_gestor_stats_schema_contract_rt_evidence.json](evidencias/gestor/CP-GES-031_gestor_stats_schema_contract_rt_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
