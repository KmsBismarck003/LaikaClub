## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-029 | Fecha de ejecución | 2026-11-16 16:14:34 |
| Nombre de la prueba | limpieza_cache_admin_oat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | OAT / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | OAT |
| Tipo de prueba | Mantenimiento Operacional |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Ejecutar procedimiento de limpieza de memoria caché en el microservicio |
| Objetivo | Comprobar ejecución de POST /api/database/clear-cache |
| Precondiciones | Admin autenticado |
| Datos de prueba | POST /api/database/clear-cache |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Disparar limpieza de caché | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar flag de éxito | success==True | success=True | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-029_limpieza_cache_admin_oat_evidence.json](evidencias/admin/CP-ADM-029_limpieza_cache_admin_oat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
