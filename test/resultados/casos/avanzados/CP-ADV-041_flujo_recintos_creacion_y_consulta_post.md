## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-041 | Fecha de ejecución | 2026-11-16 16:15:52 |
| Nombre de la prueba | flujo_recintos_creacion_y_consulta_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Recintos / Creación | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Administrador |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar creación integral y persistencia física de un nuevo recinto |
| Objetivo | Comprobar registro con nombre, dirección, ciudad, aforo y geolocalización |
| Precondiciones | Servicio laika_events activo; token admin |
| Datos de prueba | Ruta: POST /api/venues |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Crear recinto cultural | HTTP 200 con ID generado | HTTP 200 (ID: 88) | ✓ |
| 2 | Listar recintos activos | HTTP 200 con listado | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-041_flujo_recintos_creacion_y_consulta_post_evidence.json](evidencias/avanzados/CP-ADV-041_flujo_recintos_creacion_y_consulta_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Recinto creado y persistido con éxito (ID: 88) |
