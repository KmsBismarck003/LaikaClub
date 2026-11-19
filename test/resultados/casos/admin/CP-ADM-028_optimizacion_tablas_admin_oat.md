## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-028 | Fecha de ejecución | 2026-11-16 16:14:34 |
| Nombre de la prueba | optimizacion_tablas_admin_oat | Responsable (tester) | QA Automation |
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
| Descripción | Ejecutar procedimiento de optimización física de tablas MySQL |
| Objetivo | Comprobar ejecución de POST /api/database/optimize sin errores de servidor |
| Precondiciones | Admin autenticado |
| Datos de prueba | POST /api/database/optimize |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Disparar optimización de tablas | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar respuesta de optimización | success==True | success=True | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-028_optimizacion_tablas_admin_oat_evidence.json](evidencias/admin/CP-ADM-028_optimizacion_tablas_admin_oat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
