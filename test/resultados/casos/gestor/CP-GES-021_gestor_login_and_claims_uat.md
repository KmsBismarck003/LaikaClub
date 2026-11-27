## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-021 | Fecha de ejecución | 2026-11-16 16:15:29 |
| Nombre de la prueba | gestor_login_and_claims_uat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UAT / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UAT |
| Tipo de prueba | Aceptación / Autenticación |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar proceso de login y emisión de claims de rol gestor |
| Objetivo | Garantizar que el gestor inicie sesión y reciba role='gestor' |
| Precondiciones | Credenciales oficiales de gestor |
| Datos de prueba | email=gestor@laikaclub.com |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Autenticar gestor | HTTP 200 con token y role='gestor' | HTTP 200, role=gestor | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-021_gestor_login_and_claims_uat_evidence.json](evidencias/gestor/CP-GES-021_gestor_login_and_claims_uat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
