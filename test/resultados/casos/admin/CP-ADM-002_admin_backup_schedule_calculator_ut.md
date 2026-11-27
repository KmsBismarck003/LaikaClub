## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-002 | Fecha de ejecución | 2026-11-16 16:15:32 |
| Nombre de la prueba | admin_backup_schedule_calculator_ut | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UT / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UT |
| Tipo de prueba | Lógica / Algoritmos |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar cálculo de próximo respaldo automático |
| Objetivo | Verificar cálculo de fecha y hora para respaldo diario |
| Precondiciones | Algoritmo de cálculo temporal |
| Datos de prueba | Frecuencia diaria a las 02:00 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Calcular próximo respaldo diario | 2026-11-17 02:00:00 | 2026-11-17 02:00:00 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-002_admin_backup_schedule_calculator_ut_evidence.json](evidencias/admin/CP-ADM-002_admin_backup_schedule_calculator_ut_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
