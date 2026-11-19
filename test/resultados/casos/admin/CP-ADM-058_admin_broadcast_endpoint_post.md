## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-058 | Fecha de ejecución | 2026-11-16 16:13:52 |
| Nombre de la prueba | admin_broadcast_endpoint_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Comunicaciones |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint POST /api/auth/admin/broadcast |
| Objetivo | Garantizar difusión de comunicados masivos a la base de usuarios |
| Precondiciones | Admin autenticado |
| Datos de prueba | POST /api/auth/admin/broadcast |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | POST con contenido vacío rechaza adecuadamente | HTTP 400/500 Contenido faltante | HTTP 500 | ✓ |
| 2 | Auditoría de arquitectura de difusión masiva | Cola asíncrona (RabbitMQ/Kafka) | Bucle síncrono sobre 30,040 usuarios activos en memoria | ✗ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Fallida |
| Evidencias | [CP-ADM-058_admin_broadcast_endpoint_post_evidence.json](evidencias/admin/CP-ADM-058_admin_broadcast_endpoint_post_evidence.json) |
| Defecto reportado | DEF-ADM-002 |
| Severidad del defecto | Crítica |
| Observaciones | DEF-ADM-002: El endpoint ejecuta un bucle síncrono sobre toda la base de usuarios activos (30,040 correos) bloqueando el hilo de Tomcat y provocando DoS en el microservicio de autenticación |
