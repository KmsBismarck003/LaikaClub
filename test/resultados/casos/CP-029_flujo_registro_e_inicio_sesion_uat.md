## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-029 | Fecha de ejecución | 2026-11-16 12:56:53 |
| Nombre de la prueba | flujo_registro_e_inicio_sesion_uat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UAT / Onboarding y Autenticación | Ambiente | QA / Docker Live Services |
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
| Descripción | Evalúa el flujo de aceptación del usuario desde la perspectiva de una persona real que se registra y posteriormente inicia sesión. |
| Objetivo | Garantizar que un nuevo usuario pueda registrarse sin fricción y acceder inmediatamente con sus credenciales. |
| Precondiciones | Servicios de autenticación y base de datos disponibles. |
| Datos de prueba | Usuario dinámico: uat_user_<timestamp>@laikaclub.com, Pass: 'PassUAT2026!' |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Registrar nuevo usuario mediante formulario de registro | Cuenta creada exitosamente con token o confirmación | HTTP 200 | ✓ |
| 2 | Iniciar sesión en el portal con las credenciales registradas | Ingreso concedido y token JWT devuelto | HTTP 200, Token emitido: Sí | ✓ |
| 3 | Verificar que el rol asignado por defecto sea 'usuario' | Rol = 'usuario' | Rol obtenido: 'usuario' | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-029_flujo_registro_e_inicio_sesion_uat_evidence.json](evidencias/CP-029_flujo_registro_e_inicio_sesion_uat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El recorrido de bienvenida y acceso satisface los criterios de aceptación del usuario. |
