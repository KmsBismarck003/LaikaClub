## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-001 | Fecha de ejecución | 2026-11-16 16:15:33 |
| Nombre de la prueba | gestor_event_duration_calculator_ut | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UT / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UT |
| Tipo de prueba | Lógica / Funciones |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar cálculo de tiempo de finalización de evento |
| Objetivo | Garantizar que la duración en minutos se sume correctamente a la hora inicial |
| Precondiciones | Hora inicial HH:MM y duración en minutos |
| Datos de prueba | start='14:00', duration=600 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Calcular fin para evento de 10 horas | 24:00 | 24:00 | ✓ |
| 2 | Calcular fin para show de 90 min | 22:00 | 22:00 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-001_gestor_event_duration_calculator_ut_evidence.json](evidencias/gestor/CP-GES-001_gestor_event_duration_calculator_ut_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
