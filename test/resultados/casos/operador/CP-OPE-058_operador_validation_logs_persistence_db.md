## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-058 | Fecha de ejecución | 2026-11-16 16:14:17 |
| Nombre de la prueba | operador_validation_logs_persistence_db | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | DATABASE / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | DATABASE |
| Tipo de prueba | Base de Datos / Persistencia |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar en MySQL la existencia y persistencia de columnas en ticket_validation_logs. |
| Objetivo | Comprobar integridad de esquema relacional y registro permanente de auditoría óptica |
| Precondiciones | Contenedor laika_db activo en puerto 3306 |
| Datos de prueba | Tabla: ticket_validation_logs |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Verificar esquema y persistencia en MySQL | Esquema íntegro y registros > 0 | Columnas OK, Total logs=226 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-058_operador_validation_logs_persistence_db_evidence.json](evidencias/operador/CP-OPE-058_operador_validation_logs_persistence_db_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Esquema verificado. Total logs persistidos: 226 |
