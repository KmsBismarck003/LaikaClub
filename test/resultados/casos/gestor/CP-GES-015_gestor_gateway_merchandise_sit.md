## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-015 | Fecha de ejecución | 2026-11-16 16:15:02 |
| Nombre de la prueba | gestor_gateway_merchandise_sit | Responsable (tester) | QA Automation |
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
| Descripción | Comprobar comunicación Gateway -> Merchandise Service (/api/merchandise?manager_id=3) |
| Objetivo | Verificar recuperación de catálogo de productos oficiales del gestor |
| Precondiciones | Merchandise Service activo |
| Datos de prueba | GET /api/merchandise?manager_id=3 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar catálogo de mercancía | HTTP 200 con lista JSON | HTTP 200, total=2 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-015_gestor_gateway_merchandise_sit_evidence.json](evidencias/gestor/CP-GES-015_gestor_gateway_merchandise_sit_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
