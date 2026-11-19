## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-032 | Fecha de ejecución | 2026-11-16 16:15:51 |
| Nombre de la prueba | flujo_logros_cupon_invalido_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Logros / Cupones | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Validación / Negativo |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar rechazo ante intento de aplicar un código de cupón inexistente o inventado |
| Objetivo | Comprobar que cupones falsos no otorguen descuentos indebidos |
| Precondiciones | Servicio laika_achievements activo |
| Datos de prueba | Código: CUPON-FALSO-999 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Validar cupón espurio | valid: false en respuesta | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-032_flujo_logros_cupon_invalido_post_evidence.json](evidencias/avanzados/CP-ADV-032_flujo_logros_cupon_invalido_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Cupón inválido rechazado: valid=False, detail=Cupón no válido o no pertenece a tu usuario |
