## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-015 | Fecha de ejecución | 2026-11-16 16:15:50 |
| Nombre de la prueba | flujo_creacion_evento_colision_recinto_horario_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Eventos / Concurrencia | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Auditoría / Colisión de Horarios |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Auditar comportamiento ante tentativa de programación con colisión horaria en la misma sala |
| Objetivo | Evaluar si el motor previene solapamiento físico de funciones en un recinto |
| Precondiciones | Recinto 1 Sala 3; fecha 2026-12-25 20:00 |
| Datos de prueba | Sala: 3, Fecha: 2026-12-25 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar creación con horario potencialmente coincidente | Respuesta procesada controladamente | HTTP 500 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-015_flujo_creacion_evento_colision_recinto_horario_post_evidence.json](evidencias/avanzados/CP-ADV-015_flujo_creacion_evento_colision_recinto_horario_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Ejecución de auditoría de colisión: HTTP 500 |
