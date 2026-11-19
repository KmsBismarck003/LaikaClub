## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-039 | Fecha de ejecución | 2026-11-16 16:15:00 |
| Nombre de la prueba | gestor_transactions_rbac_bypass_sec | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | SECURITY / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SECURITY |
| Tipo de prueba | Seguridad / RBAC |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar restricción de acceso en endpoint financiero de transacciones |
| Objetivo | Garantizar que un usuario regular (rol 'usuario') sea rechazado con HTTP 403 |
| Precondiciones | Token de usuario regular |
| Datos de prueba | GET /api/manager/transactions |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Usuario regular accediendo a transacciones de gestor | HTTP 403 Forbidden | HTTP 200 | ✗ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Fallida |
| Evidencias | [CP-GES-039_gestor_transactions_rbac_bypass_sec_evidence.json](evidencias/gestor/CP-GES-039_gestor_transactions_rbac_bypass_sec_evidence.json) |
| Defecto reportado | DEF-GES-001 |
| Severidad del defecto | Alta |
| Observaciones | Falla de Control de Acceso RBAC: /api/manager/transactions permite acceso a usuarios regulares sin validar rol gestor |
