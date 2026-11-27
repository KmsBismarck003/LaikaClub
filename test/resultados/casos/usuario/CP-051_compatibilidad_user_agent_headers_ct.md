## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-051 | Fecha de ejecución | 2026-11-16 16:14:15 |
| Nombre de la prueba | compatibilidad_user_agent_headers_ct | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Compatibilidad / Multi-Plataforma y Navegadores | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | CT |
| Tipo de prueba | Compatibilidad |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa que el API Gateway y los microservicios procesen correctamente peticiones con cabeceras User-Agent de Chrome, Safari, Firefox y dispositivos móviles. |
| Objetivo | Garantizar que no existan filtros restrictivos ni bloqueos indebidos basados en el agente de usuario. |
| Precondiciones | Servicios activos en puerto 8000. |
| Datos de prueba | User-Agents: Chrome Desktop, Safari macOS, Firefox Linux, iPhone Safari, Android Chrome |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar catálogo con User-Agent de Chrome Desktop | HTTP 200 OK sin bloqueos de agente | HTTP 200 | ✓ |
| 2 | Consultar catálogo con User-Agent de Safari macOS | HTTP 200 OK sin bloqueos de agente | HTTP 200 | ✓ |
| 3 | Consultar catálogo con User-Agent de Firefox Linux | HTTP 200 OK sin bloqueos de agente | HTTP 200 | ✓ |
| 4 | Consultar catálogo con User-Agent de iPhone Safari | HTTP 200 OK sin bloqueos de agente | HTTP 200 | ✓ |
| 5 | Consultar catálogo con User-Agent de Android Chrome | HTTP 200 OK sin bloqueos de agente | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-051_compatibilidad_user_agent_headers_ct_evidence.json](evidencias/usuario/CP-051_compatibilidad_user_agent_headers_ct_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El Gateway procesa con neutralidad solicitudes de diversos sistemas operativos y clientes. |
