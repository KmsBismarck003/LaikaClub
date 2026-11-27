## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-030 | Fecha de ejecución | 2026-11-16 16:15:51 |
| Nombre de la prueba | flujo_logros_beneficios_cupones_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Logros / Beneficios | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Beneficios |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar entrega de beneficios: consulta de cupones de descuento otorgados por logros |
| Objetivo | Comprobar que el usuario reciba los cupones asociados a su nivel de fidelización |
| Precondiciones | Servicio laika_achievements activo; usuario autenticado |
| Datos de prueba | N/A |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar cupones de fidelización | HTTP 200 OK con lista de cupones | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-030_flujo_logros_beneficios_cupones_get_evidence.json](evidencias/avanzados/CP-ADV-030_flujo_logros_beneficios_cupones_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | 200 OK obtenido con 3 cupones activos (ej. LAIKA-01-2WBIEP) |
