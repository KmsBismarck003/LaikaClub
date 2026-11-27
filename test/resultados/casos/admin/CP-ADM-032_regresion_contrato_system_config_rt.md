## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-032 | Fecha de ejecución | 2026-11-16 16:14:50 |
| Nombre de la prueba | regresion_contrato_system_config_rt | Responsable (tester) | QA Automation |
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
| Descripción | Validar contrato de respuesta de configuración runtime en /api/config |
| Objetivo | Comprobar presencia de campos requeridos por el frontend de administración |
| Precondiciones | Admin autenticado |
| Datos de prueba | GET /api/config |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Solicitar configuración global | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar claves maestras | Cero claves faltantes | Faltantes: [] | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-032_regresion_contrato_system_config_rt_evidence.json](evidencias/admin/CP-ADM-032_regresion_contrato_system_config_rt_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
