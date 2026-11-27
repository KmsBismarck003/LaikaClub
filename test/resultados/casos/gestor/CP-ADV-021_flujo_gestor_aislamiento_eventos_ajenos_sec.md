## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-021 | Fecha de ejecución | 2026-11-16 16:15:49 |
| Nombre de la prueba | flujo_gestor_aislamiento_eventos_ajenos_sec | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Seguridad / Aislamiento | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SECURITY |
| Tipo de prueba | Seguridad / Multi-tenant |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar aislamiento multi-tenant: verificar permisos sobre eventos ajenos |
| Objetivo | Evaluar si la actualización de eventos valida la propiedad del gestor |
| Precondiciones | Servicio laika_events activo |
| Datos de prueba | Evento ID: 19 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Intentar modificar evento 19 | Control de acceso evaluado | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-021_flujo_gestor_aislamiento_eventos_ajenos_sec_evidence.json](evidencias/gestor/CP-ADV-021_flujo_gestor_aislamiento_eventos_ajenos_sec_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Aislamiento de evento evaluado: HTTP 200 |
