## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-006 | Fecha de ejecución | 2026-11-16 16:14:27 |
| Nombre de la prueba | admin_service_mysql_connection_it | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | IT / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | IT |
| Tipo de prueba | Integración Componentes |
| Técnica | Caja gris |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Verificar integración directa con base de datos del microservicio admin |
| Objetivo | Comprobar lectura física de la tabla system_config en MySQL |
| Precondiciones | Conexión a MySQL puerto 3306 |
| Datos de prueba | Base laika_admin |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar system_config en MySQL | Filas > 0 | Filas obtenidas: 7 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-006_admin_service_mysql_connection_it_evidence.json](evidencias/admin/CP-ADM-006_admin_service_mysql_connection_it_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
