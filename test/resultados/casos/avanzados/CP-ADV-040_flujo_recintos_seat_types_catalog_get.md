## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-040 | Fecha de ejecución | 2026-11-16 16:15:53 |
| Nombre de la prueba | flujo_recintos_seat_types_catalog_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Recintos / Tipos Butaca | Ambiente | QA / Docker Live Services |
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
| Descripción | Validar catálogo de tipos de asiento y butacas configurables en salas |
| Objetivo | Comprobar disponibilidad de tipos reservables (VIP, General, Accesibilidad) |
| Precondiciones | Servicio laika_events activo |
| Datos de prueba | Ruta: GET /api/venues/seat-types |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar tipos de asiento | HTTP 200 con listado | HTTP 200 (8 tipos) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-040_flujo_recintos_seat_types_catalog_get_evidence.json](evidencias/avanzados/CP-ADV-040_flujo_recintos_seat_types_catalog_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Tipos de butaca configurables validados: 8 categorías |
