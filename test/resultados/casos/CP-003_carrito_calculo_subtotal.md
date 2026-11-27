## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-003 | Fecha de ejecución | 2026-11-16 12:56:57 |
| Nombre de la prueba | carrito_calculo_subtotal | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Carrito y Checkout Frontend | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UT |
| Tipo de prueba | Funcional |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprueba el cálculo aritmético de subtotal, cargo por servicio (10%) y aplicación de descuento. |
| Objetivo | Garantizar que no existan discrepancias de redondeo ni errores en la acumulación de importes. |
| Precondiciones | Estructura de items con precio y cantidad válida. |
| Datos de prueba | Item A: $500 (cant: 2), Item B: $250 (cant: 1), Cupón: $100 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Calcular subtotal de items | $1250.00 | $1250.00 | ✓ |
| 2 | Calcular cargo por servicio del 10% | $125.00 | $125.00 | ✓ |
| 3 | Calcular total neto con descuento de cupón | $1275.00 | $1275.00 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-003_carrito_calculo_subtotal_evidence.json](evidencias/CP-003_carrito_calculo_subtotal_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Precisión decimal conforme a estándares financieros. |
