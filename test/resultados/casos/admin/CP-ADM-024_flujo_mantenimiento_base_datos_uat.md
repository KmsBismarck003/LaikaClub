## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-024 | Fecha de ejecución | 2026-11-16 16:15:20 |
| Nombre de la prueba | flujo_mantenimiento_base_datos_uat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UAT / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UAT |
| Tipo de prueba | Aceptación de Usuario |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Flujo de aceptación de mantenimiento y salud de base de datos |
| Objetivo | Consultar tablas, estadísticas de almacenamiento y ejecutar limpieza de caché |
| Precondiciones | Admin autenticado |
| Datos de prueba | /api/database/* |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Inspeccionar catálogo de tablas | HTTP 200 | HTTP 200 | ✓ |
| 2 | Inspeccionar estadísticas de almacenamiento | HTTP 200 | HTTP 200 | ✓ |
| 3 | Ejecutar limpieza de caché en microservicio admin | HTTP 200 | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-024_flujo_mantenimiento_base_datos_uat_evidence.json](evidencias/admin/CP-ADM-024_flujo_mantenimiento_base_datos_uat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
