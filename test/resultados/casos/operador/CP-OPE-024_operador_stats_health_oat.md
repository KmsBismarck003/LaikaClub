## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-024 | Fecha de ejecución | 2026-11-16 16:14:36 |
| Nombre de la prueba | operador_stats_health_oat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | OAT / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | OAT |
| Tipo de prueba | Operativo / Disponibilidad |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar disponibilidad operativa del microservicio Stats (/health) |
| Objetivo | Garantizar que el microservicio analítico de staff responda HTTP 200 |
| Precondiciones | Contenedor laika_stats |
| Datos de prueba | GET http://localhost:8103/health |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Health check de Stats Service | HTTP 200 | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-024_operador_stats_health_oat_evidence.json](evidencias/operador/CP-OPE-024_operador_stats_health_oat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
