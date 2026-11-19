## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-030 | Fecha de ejecución | 2026-11-16 16:14:50 |
| Nombre de la prueba | regresion_contrato_admin_users_rt | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | RT / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | RT |
| Tipo de prueba | Regresión / Contratos |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar contrato de respuesta JSON del endpoint /api/admin/users |
| Objetivo | Garantizar que el contrato DTO conserve total, users con id, email, role, status |
| Precondiciones | Admin autenticado |
| Datos de prueba | GET /api/admin/users |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Solicitar usuarios para validar contrato DTO | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar campos obligatorios del esquema | Esquema íntegro | total=True, users=True, fields=True | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-030_regresion_contrato_admin_users_rt_evidence.json](evidencias/admin/CP-ADM-030_regresion_contrato_admin_users_rt_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
