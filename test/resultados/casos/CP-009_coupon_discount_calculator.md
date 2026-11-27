## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-009 | Fecha de ejecución | 2026-11-16 12:56:57 |
| Nombre de la prueba | coupon_discount_calculator | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Gamificación / Cupones Backend | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UT |
| Tipo de prueba | Reglas de negocio |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa los tres tipos de descuento de cupones soportados por laika_achievements. |
| Objetivo | Verificar que el descuento no sobrepase el subtotal ni aplique porcentajes incorrectos. |
| Precondiciones | Valores de cupón positivos. |
| Datos de prueba | Subtotal: $1000.00, Tipos: percentage (15%), fixed ($200), service_fee (50% de comision del 10%) |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Calcular cupón de 15% de descuento sobre $1000 | $150.00 | $150.00 | ✓ |
| 2 | Calcular cupón fijo de $200 sobre $1000 | $200.00 | $200.00 | ✓ |
| 3 | Calcular cupón fijo de $1500 sobre $1000 (tope) | $1000.00 | $1000.00 | ✓ |
| 4 | Calcular 50% de descuento sobre el cargo de servicio (10%) | $50.00 | $50.00 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-009_coupon_discount_calculator_evidence.json](evidencias/CP-009_coupon_discount_calculator_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Fórmulas alineadas con AchievementsController y el carrito. |
