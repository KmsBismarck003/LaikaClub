## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-021 | Fecha de ejecución | 2026-11-16 16:15:02 |
| Nombre de la prueba | comunicacion_achievements_tickets_sit | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | SIT / Achievements <-> Tickets Inter-Service | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SIT |
| Tipo de prueba | Integración de Sistema |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa cómo laika_achievements (8301) consulta al microservicio de tickets (8202) para obtener el ticketCount y determinar el nivel de lealtad. |
| Objetivo | Verificar que GET /api/achievements/my retorne el nivel y ticketCount calculado a partir de los boletos reales del usuario. |
| Precondiciones | Ambos microservicios en ejecución y usuario autenticado. |
| Datos de prueba | Token JWT del usuario de prueba. |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar boletos directos en tickets | HTTP 200 con lista de boletos | HTTP 200, conteo: 62 | ✓ |
| 2 | Consultar progreso en /api/achievements/my | HTTP 200 con estructura ProgressResponse | HTTP 200 | ✓ |
| 3 | Validar campos tier/userTier y achievements en respuesta | Campos de gamificación presentes | Tier: 7, Logros: 7 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-021_comunicacion_achievements_tickets_sit_evidence.json](evidencias/usuario/CP-021_comunicacion_achievements_tickets_sit_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Sincronización de reglas de gamificación en tiempo real validada. |
