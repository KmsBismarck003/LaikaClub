## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-043 | Fecha de ejecución | 2026-11-16 12:56:43 |
| Nombre de la prueba | latencia_login_usuario_pt | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Rendimiento / Latencia de Autenticación | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | PT |
| Tipo de prueba | Rendimiento |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Mide el tiempo de respuesta total del login (incluyendo la verificación del hash BCrypt y la emisión del token JWT) con umbral SLA < 1000ms. |
| Objetivo | Garantizar que la seguridad criptográfica no penalice excesivamente la experiencia de inicio de sesión. |
| Precondiciones | Servicio de autenticación en línea. |
| Datos de prueba | Muestra de 5 inicios de sesión con credenciales válidas |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Ejecutar 5 autenticaciones consecutivas | 5 respuestas HTTP 200 | 5/5 completadas | ✓ |
| 2 | Evaluar latencia de login contra umbral de SLA (1000 ms) | Tiempo promedio < 1000 ms | Promedio: 155.43 ms (Máximo: 171.30 ms) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-043_latencia_login_usuario_pt_evidence.json](evidencias/CP-043_latencia_login_usuario_pt_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El coste computacional de BCrypt se encuentra dentro de parámetros aceptables. |
