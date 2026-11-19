## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-026 | Fecha de ejecución | 2026-11-16 16:14:35 |
| Nombre de la prueba | salud_microservicio_admin_oat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | OAT / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | OAT |
| Tipo de prueba | Disponibilidad Operativa |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Verificar estado operativo y endpoint /health del microservicio laika_admin |
| Objetivo | Garantizar que el servicio admin responde con status 'alive' |
| Precondiciones | Microservicio activo en puerto 8102 |
| Datos de prueba | GET http://localhost:8102/health |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /health en microservicio admin | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar payload de salud | status=='alive' | status=alive | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-026_salud_microservicio_admin_oat_evidence.json](evidencias/admin/CP-ADM-026_salud_microservicio_admin_oat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
