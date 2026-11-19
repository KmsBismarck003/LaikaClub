## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-009 | Fecha de ejecución | 2026-11-16 16:14:34 |
| Nombre de la prueba | operador_auth_user_query_it | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | IT / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | IT |
| Tipo de prueba | Integración / Base de datos |
| Técnica | Caja gris |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar persistencia y rol de operador en laika_auth.users |
| Objetivo | Garantizar que el operador ID 2 tenga role='operador' y status='active' |
| Precondiciones | Base de datos laika_auth |
| Datos de prueba | SELECT id, email, role FROM users WHERE id = 2 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar cuenta de operador oficial | operador@laikaclub.com con role='operador' | Registro: (2, 'operador@laikaclub.com', 'operador', 'active') | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-009_operador_auth_user_query_it_evidence.json](evidencias/operador/CP-OPE-009_operador_auth_user_query_it_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
