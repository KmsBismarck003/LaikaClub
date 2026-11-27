## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-019 | Fecha de ejecución | 2026-11-16 16:15:30 |
| Nombre de la prueba | operador_login_and_claims_uat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UAT / Operador | Ambiente | QA / Docker Live Services |
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
| Descripción | Comprobar proceso de autenticación y entrega de permisos de Operador |
| Objetivo | Garantizar que el operador inicie sesión y reciba role='operador' |
| Precondiciones | Credenciales oficiales de operador |
| Datos de prueba | email=operador@laikaclub.com |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Autenticar operador | HTTP 200 con token y role='operador' | HTTP 200, role=operador | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-019_operador_login_and_claims_uat_evidence.json](evidencias/operador/CP-OPE-019_operador_login_and_claims_uat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
