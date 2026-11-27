## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-036 | Fecha de ejecución | 2026-11-16 12:56:36 |
| Nombre de la prueba | generacion_logs_docker_oat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | OAT / Observabilidad y Logs | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | OAT |
| Tipo de prueba | Operacional / Logs |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa la generación de registros en vivo mediante inspección de logs de contenedores Docker y archivos de bitácora del sistema. |
| Objetivo | Garantizar que las transacciones y peticiones HTTP queden debidamente registradas para auditoría. |
| Precondiciones | Contenedores Docker en ejecución. |
| Datos de prueba | Contenedor 'laika_gateway' y 'laika_tickets' |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Capturar las últimas líneas de bitácora de 'laika_gateway' | Trazas de log registradas en stdout | 15 líneas de registro capturadas | ✓ |
| 2 | Capturar las últimas líneas de bitácora de 'laika_tickets' | Trazas Spring Boot registradas en stdout | 15 líneas de registro capturadas | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-036_generacion_logs_docker_oat_evidence.json](evidencias/CP-036_generacion_logs_docker_oat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Los contenedores emiten telemetría y bitácora estándar para trazabilidad operativa. |
