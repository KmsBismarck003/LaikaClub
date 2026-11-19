## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-025 | Fecha de ejecución | 2026-11-16 16:15:19 |
| Nombre de la prueba | flujo_configuracion_global_plataforma_uat | Responsable (tester) | QA Automation |
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
| Descripción | Flujo de aceptación de configuración global de la plataforma |
| Objetivo | Consultar configuración runtime, actualizar un parámetro y verificar su persistencia |
| Precondiciones | Admin autenticado |
| Datos de prueba | /api/config/* |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Leer configuración global actual | HTTP 200 | HTTP 200 | ✓ |
| 2 | Actualizar parámetro global de prueba | HTTP 200 | HTTP 200 | ✓ |
| 3 | Verificar persistencia del valor | value=='enabled_by_qa' | value=enabled_by_qa | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-025_flujo_configuracion_global_plataforma_uat_evidence.json](evidencias/admin/CP-ADM-025_flujo_configuracion_global_plataforma_uat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
