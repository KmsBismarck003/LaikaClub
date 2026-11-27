## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-052 | Fecha de ejecución | 2026-11-16 14:13:29 |
| Nombre de la prueba | API Staff Dashboard Stats GET | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API Testing | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | API REST - Operador |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción |  |
| Objetivo | Validar que GET /api/stats/staff/dashboard devuelva métricas operativas clave para la consola de control de acceso. |
| Precondiciones | Servicio laika_stats activo; credenciales de operador. |
| Datos de prueba |  |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar GET /api/stats/staff/dashboard | None | {'status_code': 200} | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Fallida |
| Evidencias | [CP-OPE-052_api_staff_dashboard_stats_get_evidence.json](evidencias/operador/CP-OPE-052_api_staff_dashboard_stats_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Esperado: 200 OK con métricas de dashboard staff | Obtenido: Falta clave 'todayValidations' |
