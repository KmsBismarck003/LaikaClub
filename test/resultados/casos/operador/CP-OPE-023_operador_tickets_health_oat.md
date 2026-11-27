## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-023 | Fecha de ejecución | 2026-11-16 16:14:36 |
| Nombre de la prueba | operador_tickets_health_oat | Responsable (tester) | QA Automation |
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
| Descripción | Comprobar disponibilidad operativa del microservicio Tickets (/health) |
| Objetivo | Garantizar que el motor de validación de boletos responda status=alive |
| Precondiciones | Contenedor laika_tickets |
| Datos de prueba | GET http://localhost:8202/health |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Health check de Tickets Service | HTTP 200 y status='alive' | HTTP 200, status=alive | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-023_operador_tickets_health_oat_evidence.json](evidencias/operador/CP-OPE-023_operador_tickets_health_oat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
