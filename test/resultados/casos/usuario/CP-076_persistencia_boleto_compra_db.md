## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-076 | Fecha de ejecución | 2026-11-16 16:14:17 |
| Nombre de la prueba | persistencia_boleto_compra_db | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Base de Datos / laika_tickets.tickets | Ambiente | QA / Docker Live Services |
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
| Descripción | Audita directamente la tabla física laika_tickets.tickets en MySQL para validar la presencia de boletos y la integridad de sus campos clave. |
| Objetivo | Garantizar que todo boleto posea ticket_code único, user_id, event_id, status y fecha de compra no nula. |
| Precondiciones | MySQL activo en localhost:3306. |
| Datos de prueba | Muestra de boletos persistidos en laika_tickets.tickets |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar registros de boletos directamente en laika_tickets.tickets | Boletos encontrados en base de datos física | 10 boletos recuperados | ✓ |
| 2 | Validar integridad del campo ticket_code (no nulo, longitud > 3) | Todos los códigos de boleto válidos | Válidos en todos los registros | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-076_persistencia_boleto_compra_db_evidence.json](evidencias/usuario/CP-076_persistencia_boleto_compra_db_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | La tabla de boletos conserva la integridad transaccional requerida. |
