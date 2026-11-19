## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-018 | Fecha de ejecución | 2026-11-16 16:15:51 |
| Nombre de la prueba | flujo_mercancia_cambio_estado_admin_put | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Mercancía / Moderación | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Admin |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar moderación administrativa: cambio de estado de publicación de mercancía oficial |
| Objetivo | Comprobar facultad de administradores para aprobar productos en tienda |
| Precondiciones | Servicio laika_merchandise activo; credenciales admin |
| Datos de prueba | Merch ID: 99, admin_status: approved |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Actualizar estado admin de mercancía ID 99 | HTTP 200 con entidad actualizada | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-018_flujo_mercancia_cambio_estado_admin_put_evidence.json](evidencias/admin/CP-ADV-018_flujo_mercancia_cambio_estado_admin_put_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Moderación de mercancía ejecutada exitosamente: HTTP 200 |
