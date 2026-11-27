## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-040 | Fecha de ejecución | 2026-11-16 12:56:43 |
| Nombre de la prueba | regresion_calculo_totales_rt | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Regresión / Integridad Financiera | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | RT |
| Tipo de prueba | Regresión |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Audita que la fórmula estándar de desglose de compra (Subtotal + 10% Cargo por Servicio - Descuentos) se conserve inalterada. |
| Objetivo | Garantizar que no existan regresiones aritméticas en el proceso de cobro y liquidación. |
| Precondiciones | Parámetros base: tasa de servicio = 10%. |
| Datos de prueba | Precios unitarios: $1000, $500, $250; Cantidades: 1, 2, 3 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Evaluar cálculo para 1 item(s) de $1000.00 | Fee=$100.00, Total=$1100.00 | Fee=$100.00, Total=$1100.00 | ✓ |
| 2 | Evaluar cálculo para 2 item(s) de $450.50 | Fee=$90.10, Total=$991.10 | Fee=$90.10, Total=$991.10 | ✓ |
| 3 | Evaluar cálculo para 3 item(s) de $200.00 | Fee=$60.00, Total=$660.00 | Fee=$60.00, Total=$660.00 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-040_regresion_calculo_totales_rt_evidence.json](evidencias/CP-040_regresion_calculo_totales_rt_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Fórmulas financieras estables y consistentes con la versión de referencia. |
