## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-035 | Fecha de ejecución | 2026-11-16 16:14:36 |
| Nombre de la prueba | salud_gateway_pilgrim_oat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | OAT / Disponibilidad de Gateway | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | OAT |
| Tipo de prueba | Operacional / Disponibilidad |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa los endpoints de diagnóstico raíz ('/') y salud ('/api/health') de Pilgrim API Gateway. |
| Objetivo | Verificar que el Gateway esté online, reporte versión 2.0.0 y exponga los dominios de servicio registrados. |
| Precondiciones | Contenedor laika_gateway en ejecución en puerto 8000. |
| Datos de prueba | GET / y GET /api/health |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar endpoint /api/health del Gateway | HTTP 200 con {'status': 'healthy'} | HTTP 200, Payload: {'status': 'healthy', 'service': 'pilgrim'} | ✓ |
| 2 | Consultar endpoint raíz '/' para auditar topología de microservicios | status: 'online' y target_services con catálogo de servicios | Status: online, Servicios registrados: 10 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-035_salud_gateway_pilgrim_oat_evidence.json](evidencias/usuario/CP-035_salud_gateway_pilgrim_oat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Pilgrim Gateway opera nominalmente con todos sus enrutadores vinculados. |
