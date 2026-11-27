## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-074 | Fecha de ejecución | 2026-11-16 16:14:17 |
| Nombre de la prueba | gestor_courtesy_quotas_persistence_db | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | DATABASE / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | DATABASE |
| Tipo de prueba | Persistencia / Base de datos |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar integridad referencial y persistencia en laika_tickets.courtesy_quotas |
| Objetivo | Validar estructura de cuotas de cortesía para gestores |
| Precondiciones | Base de datos laika_tickets |
| Datos de prueba | SELECT * FROM courtesy_quotas |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Verificar existencia y consulta de cuotas | Consulta sin error | Total cuotas: 3 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-074_gestor_courtesy_quotas_persistence_db_evidence.json](evidencias/gestor/CP-GES-074_gestor_courtesy_quotas_persistence_db_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
