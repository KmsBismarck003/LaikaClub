## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-041 | Fecha de ejecución | 2026-11-16 16:14:14 |
| Nombre de la prueba | compatibilidad_user_agents_admin_ct | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | CT / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | CT |
| Tipo de prueba | Compatibilidad / Headers |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar compatibilidad de API Admin con cabeceras User-Agent de navegadores modernos |
| Objetivo | Comprobar funcionamiento idéntico con Chrome, Firefox, Edge y Safari |
| Precondiciones | Admin autenticado |
| Datos de prueba | GET /api/admin/users |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Petición con User-Agent #1 | HTTP 200 | HTTP 200 | ✓ |
| 2 | Petición con User-Agent #2 | HTTP 200 | HTTP 200 | ✓ |
| 3 | Petición con User-Agent #3 | HTTP 200 | HTTP 200 | ✓ |
| 4 | Petición con User-Agent #4 | HTTP 200 | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-041_compatibilidad_user_agents_admin_ct_evidence.json](evidencias/admin/CP-ADM-041_compatibilidad_user_agents_admin_ct_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
