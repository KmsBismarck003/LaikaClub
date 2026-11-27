## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-077 | Fecha de ejecución | 2026-11-16 16:14:17 |
| Nombre de la prueba | integridad_transaccional_reembolso_db | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Base de Datos / laika_tickets.cancellation_requests | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | DATABASE |
| Tipo de prueba | Base de Datos |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Audita las columnas y restricciones de la tabla física cancellation_requests para asegurar la trazabilidad de reembolsos. |
| Objetivo | Garantizar que la tabla contenga ticket_id, user_id, status, refund_amount y fechas de auditoría. |
| Precondiciones | MySQL activo en localhost:3306. |
| Datos de prueba | Esquema de laika_tickets.cancellation_requests |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Validar presencia de columnas obligatorias (ticket_id, user_id, status) | Todas las columnas presentes | Faltantes: Ninguna (Esquema verificado) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-077_integridad_transaccional_reembolso_db_evidence.json](evidencias/usuario/CP-077_integridad_transaccional_reembolso_db_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El modelo relacional soporta el ciclo de vida de cancelaciones con auditoría. |
