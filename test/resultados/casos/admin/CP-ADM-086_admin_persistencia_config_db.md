## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-086 | Fecha de ejecución | 2026-11-16 16:14:16 |
| Nombre de la prueba | admin_persistencia_config_db | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | DATABASE / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | DATABASE |
| Tipo de prueba | Persistencia Relacional |
| Técnica | Caja gris |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar persistencia física en MySQL de parámetros en system_config |
| Objetivo | Garantizar que al actualizar un parámetro vía API se actualice config_value en la base laika_admin |
| Precondiciones | MySQL 8.0 conexión directa |
| Datos de prueba | Tabla laika_admin.system_config |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Actualizar parámetro vía API | HTTP 200 | Petición enviada | ✓ |
| 2 | Consultar fila física en MySQL | value == 'value_qa_12345' | Encontrado: [{'key': 'db_test_param', 'value': 'value_qa_12345'}] | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-086_admin_persistencia_config_db_evidence.json](evidencias/admin/CP-ADM-086_admin_persistencia_config_db_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
