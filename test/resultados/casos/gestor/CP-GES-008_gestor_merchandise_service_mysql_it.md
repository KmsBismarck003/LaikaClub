## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-008 | Fecha de ejecución | 2026-11-16 16:14:34 |
| Nombre de la prueba | gestor_merchandise_service_mysql_it | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | IT / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | IT |
| Tipo de prueba | Integración / Base de datos |
| Técnica | Caja gris |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar integración MerchandiseService <-> laika_merchandise.merchandise_items |
| Objetivo | Validar consulta de productos oficiales registrados por el gestor |
| Precondiciones | Base de datos laika_merchandise |
| Datos de prueba | SELECT count(*) FROM merchandise_items WHERE manager_id = 3 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar mercancía de gestor 3 en MySQL | Al menos 1 producto | Total encontrados: 2 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-008_gestor_merchandise_service_mysql_it_evidence.json](evidencias/gestor/CP-GES-008_gestor_merchandise_service_mysql_it_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
