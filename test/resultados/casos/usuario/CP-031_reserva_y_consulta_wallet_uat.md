## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-031 | Fecha de ejecución | 2026-11-16 16:15:21 |
| Nombre de la prueba | reserva_y_consulta_wallet_uat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UAT / Cartera Digital (UserWallet) | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UAT |
| Tipo de prueba | Aceptación de Usuario |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa el acceso a la sección 'Mis Boletos / Cartera', verificando que el usuario visualice sus accesos digitales con código QR y estado. |
| Objetivo | Garantizar que la cartera digital presente de forma organizada las entradas activas, transferidas o pasadas. |
| Precondiciones | Usuario autenticado en la plataforma. |
| Datos de prueba | Token JWT del usuario de prueba. |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Ingresar a la vista de 'Mis Boletos' (Cartera Digital) | HTTP 200 con listado estructurado de boletos | HTTP 200, 63 boletos en cartera | ✓ |
| 2 | Comprobar existencia de boletos previos en cartera | Boletos disponibles encontrados | 63 boletos existentes | ✓ |
| 3 | Verificar estructura y legibilidad del boleto digital (código, precio, estatus) | Datos completos del boleto para ingreso al recinto | Código de boleto verificado: TKT-8563A491 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-031_reserva_y_consulta_wallet_uat_evidence.json](evidencias/usuario/CP-031_reserva_y_consulta_wallet_uat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | La cartera digital despliega con claridad los boletos y pases de acceso del usuario. |
