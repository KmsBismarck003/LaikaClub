## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-023 | Fecha de ejecución | 2026-11-16 16:15:19 |
| Nombre de la prueba | flujo_gestion_campanas_publicidad_uat | Responsable (tester) | QA Automation |
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
| Descripción | Flujo de aceptación de gestión de campañas y anuncios publicitarios |
| Objetivo | Crear anuncio, registrar interacción de clic y eliminar el anuncio |
| Precondiciones | Admin autenticado |
| Datos de prueba | CRUD /api/ads |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Crear anuncio publicitario | HTTP 200 y ID asignado | HTTP 200, id=42 | ✓ |
| 2 | Registrar interacción de clic | HTTP 200 | HTTP 200 | ✓ |
| 3 | Eliminar anuncio creado | HTTP 200 | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-023_flujo_gestion_campanas_publicidad_uat_evidence.json](evidencias/admin/CP-ADM-023_flujo_gestion_campanas_publicidad_uat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
