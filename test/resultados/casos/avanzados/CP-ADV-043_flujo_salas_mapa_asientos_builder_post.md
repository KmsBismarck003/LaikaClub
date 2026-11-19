## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-043 | Fecha de ejecución | 2026-11-16 16:15:53 |
| Nombre de la prueba | flujo_salas_mapa_asientos_builder_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Recintos / Constructor de Mapas | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Layout Builder |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar constructor y persistencia de mapas de butacas interactivas en salas |
| Objetivo | Comprobar almacenamiento y recuperación de coordenadas (x, y), etiquetas y tipos de asiento |
| Precondiciones | Servicio laika_events activo; token admin |
| Datos de prueba | Ruta: POST y GET /api/venues/rooms/252/map |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Guardar layout de 2 butacas en Sala 252 | HTTP 200 con confirmación | HTTP 200 | ✓ |
| 2 | Recuperar layout guardado | HTTP 200 con asientos VIP persistidos | HTTP 200 (2 butacas) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-043_flujo_salas_mapa_asientos_builder_post_evidence.json](evidencias/avanzados/CP-ADV-043_flujo_salas_mapa_asientos_builder_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Constructor de mapas validado: 2 butacas interactivas persistidas con éxito |
