## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-012 | Fecha de ejecución | 2026-11-16 16:15:02 |
| Nombre de la prueba | gestor_gateway_revenue_analytics_sit | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | SIT / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SIT |
| Tipo de prueba | Integración de Sistema |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar comunicación Gateway -> Events + Tickets (/api/manager/events/100001/revenue) |
| Objetivo | Verificar cálculo de ingresos brutos y netos en tiempo real |
| Precondiciones | Evento 100001 existente |
| Datos de prueba | GET /api/manager/events/100001/revenue |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consulta de ingresos financieros | HTTP 200 con 'gross' y 'net' | HTTP 200, gross=7200.0, net=7200.0 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-012_gestor_gateway_revenue_analytics_sit_evidence.json](evidencias/gestor/CP-GES-012_gestor_gateway_revenue_analytics_sit_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
