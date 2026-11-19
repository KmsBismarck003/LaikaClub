## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-039 | Fecha de ejecución | 2026-11-16 16:14:51 |
| Nombre de la prueba | regresion_contrato_endpoints_usuario_rt | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Regresión / Contratos de API | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | RT |
| Tipo de prueba | Regresión |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa que las actualizaciones de backend no hayan roto los contratos esperados por los componentes React del rol usuario. |
| Objetivo | Garantizar que campos clave en eventos y boletos sigan existiendo con sus tipos de datos esperados. |
| Precondiciones | Servicios en vivo. |
| Datos de prueba | Contratos de /api/events/public y /api/tickets/my-tickets |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Validar contrato de eventos públicos (campos id, name, category, price, status) | Todos los campos clave presentes sin roturas | Faltantes: Ninguno (Contrato íntegro) | ✓ |
| 2 | Validar contrato de boletos de usuario (/api/tickets/my-tickets) | HTTP 200 con estructura de lista JSON | HTTP 200, tipo: list | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-039_regresion_contrato_endpoints_usuario_rt_evidence.json](evidencias/usuario/CP-039_regresion_contrato_endpoints_usuario_rt_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | No se detectan regresiones de contrato que comprometan la renderización de la UI. |
