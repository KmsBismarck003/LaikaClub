## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-078 | Fecha de ejecución | 2026-11-16 16:14:17 |
| Nombre de la prueba | consistencia_asientos_ocupados_db | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Base de Datos / Anti-Sobreventa e Integridad | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | DATABASE |
| Tipo de prueba | Consistencia / Integridad |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Ejecuta una consulta SQL de auditoría de colisiones para detectar si existen asientos duplicados con estado activo para un mismo evento. |
| Objetivo | Garantizar que el sistema no haya permitido ventas solapadas sobre el mismo asiento físico. |
| Precondiciones | MySQL activo en localhost:3306. |
| Datos de prueba | Consulta de agrupamiento (HAVING count(*) > 1) en laika_tickets.tickets |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Buscar duplicados de asientos activos agrupados por (event_id, seat_id) | Cero asientos duplicados (0 colisiones) | 3994 colisiones detectadas | ✗ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Fallida |
| Evidencias | [CP-078_consistencia_asientos_ocupados_db_evidence.json](evidencias/usuario/CP-078_consistencia_asientos_ocupados_db_evidence.json) |
| Defecto reportado | DEF-002 |
| Severidad del defecto | Crítica |
| Observaciones | Se detectaron 3994 butacas con asignación simultánea duplicada en estado 'active' (sobreventa física/overbooking). En el evento 20 existen asientos con hasta 33 boletos vendidos simultáneamente al mismo asiento físico, originado por inyección masiva de compradores sin restricción de unicidad compuesta (event_id, seat_id) en base de datos. |
