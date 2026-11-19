## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-023 | Fecha de ejecución | 2026-11-16 16:15:17 |
| Nombre de la prueba | rutas_publicas_react_st | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Sistema / Navegación y Enrutamiento Frontend | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | ST |
| Tipo de prueba | Sistema |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa que el servidor web de React en puerto 3000 esté activo y sirva el bundle SPA para las rutas públicas de navegación. |
| Objetivo | Garantizar que rutas como '/', '/login', '/register', '/shop' respondan con HTTP 200 y contengan el contenedor raíz de React. |
| Precondiciones | Contenedor laikaclub-frontend en ejecución. |
| Datos de prueba | Rutas: '/', '/login', '/register', '/shop' |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Solicitar ruta pública '/' | HTTP 200 con HTML del shell SPA | HTTP 200, Bytes: 1757 | ✓ |
| 2 | Solicitar ruta pública '/login' | HTTP 200 con HTML del shell SPA | HTTP 200, Bytes: 1757 | ✓ |
| 3 | Solicitar ruta pública '/register' | HTTP 200 con HTML del shell SPA | HTTP 200, Bytes: 1757 | ✓ |
| 4 | Solicitar ruta pública '/shop' | HTTP 200 con HTML del shell SPA | HTTP 200, Bytes: 1757 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-023_rutas_publicas_react_st_evidence.json](evidencias/usuario/CP-023_rutas_publicas_react_st_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El servidor web SPA entrega el contenedor de la aplicación para todas las rutas públicas. |
