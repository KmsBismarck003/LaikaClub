## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-031 | Fecha de ejecución | 2026-11-16 16:15:51 |
| Nombre de la prueba | flujo_logros_cupon_validate_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Logros / Cupones | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Checkout |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar endpoint de validación de cupones de descuento antes de aplicarlo en el checkout |
| Objetivo | Garantizar que el sistema verifique vigencia y pertenencia del cupón |
| Precondiciones | Servicio laika_achievements activo |
| Datos de prueba | Código: LAIKA-01-2WBIEP |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Validar cupón de descuento | HTTP 200 con objeto de validación | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-031_flujo_logros_cupon_validate_post_evidence.json](evidencias/avanzados/CP-ADV-031_flujo_logros_cupon_validate_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Validación de cupón procesada: valid=False |
