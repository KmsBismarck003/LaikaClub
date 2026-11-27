## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-011 | Fecha de ejecución | 2026-11-16 16:14:34 |
| Nombre de la prueba | api_client_auth_header | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Cliente HTTP / Frontend Integration | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | IT |
| Tipo de prueba | Integración |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa la integración entre el almacén de tokens y la capa de peticiones HTTP del frontend. |
| Objetivo | Garantizar que al existir un token válido, se genere la cabecera 'Authorization: Bearer <token>' de forma consistente. |
| Precondiciones | Token JWT obtenido desde el microservicio de autenticación real. |
| Datos de prueba | Token JWT obtenido en tiempo de ejecución. |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Recuperar token JWT activo de la sesión | Token válido no nulo | Token presente (len: 203) | ✓ |
| 2 | Construir headers con get_auth_headers() | Cabecera Authorization presente con prefijo Bearer | Bearer eyJhbGciOiJIUzI1Ni... | ✓ |
| 3 | Verificar Content-Type por defecto | application/json | application/json | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-011_api_client_auth_header_evidence.json](evidencias/usuario/CP-011_api_client_auth_header_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El cliente HTTP ensambla correctamente las cabeceras requeridas para microservicios protegidos. |
