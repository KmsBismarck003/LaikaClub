## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-044 | Fecha de ejecución | 2026-11-16 13:56:10 |
| Nombre de la prueba | concurrencia_consulta_boletos_pt | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Rendimiento / Carga Concurrente | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | PT |
| Tipo de prueba | Carga |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Simula una ráfaga de 10 peticiones concurrentes simultáneas al endpoint de boletos del usuario mediante ThreadPoolExecutor. |
| Objetivo | Garantizar que el pool de conexiones y el contenedor de Spring Boot atiendan peticiones concurrentes sin errores 500. |
| Precondiciones | Servicio de tickets activo. |
| Datos de prueba | 10 hilos concurrentes autenticados con token JWT. |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Lanzar 10 peticiones HTTP concurrentes a http://localhost:8000/api/tickets/my-tickets | 10 respuestas HTTP 200 | 10/10 peticiones respondidas con 200 OK | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-044_concurrencia_consulta_boletos_pt_evidence.json](evidencias/usuario/CP-044_concurrencia_consulta_boletos_pt_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El microservicio de boletos soporta concurrencia sin degradación del servicio. |
