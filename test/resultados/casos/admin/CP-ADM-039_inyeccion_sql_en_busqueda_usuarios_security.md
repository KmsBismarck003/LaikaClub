## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-039 | Fecha de ejecución | 2026-11-16 16:14:59 |
| Nombre de la prueba | inyeccion_sql_en_busqueda_usuarios_security | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | SECURITY / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SECURITY |
| Tipo de prueba | Seguridad / SQLi |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Verificar inmunidad a inyecciones SQL en la búsqueda de usuarios |
| Objetivo | Garantizar que payloads SQL no alteren la lógica de consulta ni provoquen errores de base de datos |
| Precondiciones | Admin autenticado |
| Datos de prueba | search=' OR '1'='1 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Inyectar payload SQLi en search | HTTP 200/400 sin error de sintaxis SQL | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-039_inyeccion_sql_en_busqueda_usuarios_security_evidence.json](evidencias/admin/CP-ADM-039_inyeccion_sql_en_busqueda_usuarios_security_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
