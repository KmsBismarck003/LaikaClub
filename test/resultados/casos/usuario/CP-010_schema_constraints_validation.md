## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-010 | Fecha de ejecución | 2026-11-16 16:15:33 |
| Nombre de la prueba | schema_constraints_validation | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Base de Datos / Integridad Estructural | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UT |
| Tipo de prueba | Base de Datos |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Audita las restricciones de unicidad y no nulidad en las tablas core del usuario en MySQL. |
| Objetivo | Garantizar que la tabla 'users' y 'tickets' cuenten con índices únicos en email y ticket_code respectivamente. |
| Precondiciones | Servicio MySQL activo y accesible. |
| Datos de prueba | Bases de datos: laika_auth, laika_tickets |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Verificar restricción UNIQUE y NOT NULL en laika_auth.users.email | COLUMN_KEY=UNI, IS_NULLABLE=NO | COLUMN_KEY=UNI, IS_NULLABLE=NO | ✓ |
| 2 | Verificar restricción UNIQUE y NOT NULL en laika_tickets.tickets.ticket_code | COLUMN_KEY=UNI, IS_NULLABLE=NO | COLUMN_KEY=UNI, IS_NULLABLE=NO | ✓ |
| 3 | Verificar llaves primarias auto-incrementables en users y tickets | Ambas tablas con id auto_increment | 2 tablas verificadas con auto_increment | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-010_schema_constraints_validation_evidence.json](evidencias/usuario/CP-010_schema_constraints_validation_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Esquema relacional en MySQL cumple con las reglas de integridad de datos. |
