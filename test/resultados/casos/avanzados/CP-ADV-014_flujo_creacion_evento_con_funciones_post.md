## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-014 | Fecha de ejecución | 2026-11-16 16:15:51 |
| Nombre de la prueba | flujo_creacion_evento_con_funciones_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Eventos / Creación | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Ciclo de Vida |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar creación completa de evento por gestor con funciones, recinto y aforo en laika_events |
| Objetivo | Comprobar persistencia de nuevo evento en borrador con su función horaria |
| Precondiciones | Servicio laika_events activo; token de gestor |
| Datos de prueba | Evento: Concierto Auditoria QA 2026 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Crear evento con función horaria | HTTP 200 con ID de evento | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-014_flujo_creacion_evento_con_funciones_post_evidence.json](evidencias/avanzados/CP-ADV-014_flujo_creacion_evento_con_funciones_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Evento creado exitosamente con ID 100033 |
