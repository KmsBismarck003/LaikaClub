## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-057 | Fecha de ejecución | 2026-11-16 12:56:32 |
| Nombre de la prueba | ciclo_completo_usuario_e2e | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | E2E / Ciclo de Vida Integral del Usuario | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | E2E |
| Tipo de prueba | End-to-End |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Recorre exhaustivamente todas las fases de interacción del rol usuario: Registro -> Login -> Edición de Perfil -> Consulta de Catálogo -> Adquisición de Boleto -> Verificación en Cartera -> Consulta de Gamificación -> Atención al Cliente -> Logout. |
| Objetivo | Comprobar que todas las piezas arquitectónicas funcionen coordinadas e integradas sin errores para el usuario. |
| Precondiciones | Todos los microservicios activos en vivo en Docker. |
| Datos de prueba | Usuario dinámico con datos completos de onboarding. |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Registro de usuario en la plataforma | Cuenta creada exitosamente | HTTP 200 | ✓ |
| 2 | Inicio de sesión y recepción de JWT | Token de usuario emitido | HTTP 200 | ✓ |
| 3 | Consulta de datos de perfil inicial | Perfil retornado con éxito | HTTP 200 | ✓ |
| 4 | Exploración de cartelera de eventos | Catálogo público cargado | HTTP 200, 4 eventos | ✓ |
| 5 | Adquisición de boleto digital gratuito para evento 24 | Entrada generada | HTTP 200 | ✓ |
| 6 | Verificación del boleto en la cartera digital del usuario | Boleto listado en cartera | HTTP 200, 1 boletos | ✓ |
| 7 | Consulta de puntos y progreso de gamificación | Progreso de logros cargado | HTTP 200 | ✓ |
| 8 | Cierre de sesión seguro en el sistema | Sesión terminada con éxito | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-057_ciclo_completo_usuario_e2e_evidence.json](evidencias/CP-057_ciclo_completo_usuario_e2e_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El recorrido integral E2E del rol usuario se ejecutó con absoluta coherencia en todos los servicios. |
