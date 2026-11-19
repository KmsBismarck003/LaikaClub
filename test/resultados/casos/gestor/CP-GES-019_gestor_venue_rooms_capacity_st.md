## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-019 | Fecha de ejecución | 2026-11-16 16:15:17 |
| Nombre de la prueba | gestor_venue_rooms_capacity_st | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | ST / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | ST |
| Tipo de prueba | Funcional / Recintos |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evaluar consulta y estructura de salas para recintos del gestor |
| Objetivo | Verificar endpoint GET /api/venues/12/rooms |
| Precondiciones | Recinto ID 12 |
| Datos de prueba | GET /api/venues/12/rooms |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar salas del recinto 12 | HTTP 200 con lista de salas | HTTP 200, salas=2 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-019_gestor_venue_rooms_capacity_st_evidence.json](evidencias/gestor/CP-GES-019_gestor_venue_rooms_capacity_st_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
