## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-042 | Fecha de ejecución | 2026-11-16 16:15:53 |
| Nombre de la prueba | flujo_salas_creacion_en_recinto_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Recintos / Salas | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Aforos |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar creación de salas y escenarios dentro de un recinto registrado |
| Objetivo | Comprobar asociación de sala con aforo específico y soporte para layout interactivo |
| Precondiciones | Servicio laika_events activo; token admin |
| Datos de prueba | Ruta: POST /api/venues/{venue_id}/rooms |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Crear sala en recinto 84 | HTTP 200 con ID de sala | HTTP 200 (Sala ID: 256) | ✓ |
| 2 | Listar salas del recinto 84 | HTTP 200 con array de salas | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-042_flujo_salas_creacion_en_recinto_post_evidence.json](evidencias/avanzados/CP-ADV-042_flujo_salas_creacion_en_recinto_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Sala creada y asociada al recinto exitosamente (ID: 256) |
