## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-016 | Fecha de ejecución | 2026-11-16 16:15:51 |
| Nombre de la prueba | flujo_publicacion_y_despublicacion_evento_patch | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Eventos / Publicación | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Transición de Estado |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar transición de estados: publicación (visible) y despublicación (borrador) de eventos |
| Objetivo | Comprobar visibilidad y ocultamiento dinámico de cartelera |
| Precondiciones | Evento 100001 existente en laika_events |
| Datos de prueba | Evento ID: 100001 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Publicar evento | HTTP 200 OK 'Evento publicado' | HTTP 200 | ✓ |
| 2 | Despublicar evento | HTTP 200 OK 'Evento movido a borrador' | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-016_flujo_publicacion_y_despublicacion_evento_patch_evidence.json](evidencias/avanzados/CP-ADV-016_flujo_publicacion_y_despublicacion_evento_patch_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Ciclo completo de publicación y despublicación validado |
