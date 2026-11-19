## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-037 | Fecha de ejecución | 2026-11-16 16:14:36 |
| Nombre de la prueba | resiliencia_conexion_mysql_oat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | OAT / Resiliencia de Base de Datos | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | OAT |
| Tipo de prueba | Operacional / Resiliencia |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa la apertura, ejecución y cierre sucesivo de múltiples conexiones independientes a MySQL para validar que no existan fugas en el gestor. |
| Objetivo | Garantizar que el servicio MySQL gestione adecuadamente conexiones secuenciales sin agotar descriptores ni generar bloqueos. |
| Precondiciones | Contenedor laika_db activo en puerto 3306. |
| Datos de prueba | Bucle de 20 conexiones consecutivas realizando queries de verificación. |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Abrir, ejecutar 'SELECT 1' y cerrar 20 conexiones consecutivas a MySQL | 20 conexiones exitosas | 20/20 conexiones completadas sin error | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-037_resiliencia_conexion_mysql_oat_evidence.json](evidencias/usuario/CP-037_resiliencia_conexion_mysql_oat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El motor MySQL libera descriptores de socket y memoria limpiamente. |
