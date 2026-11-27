## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-004 | Fecha de ejecución | 2026-11-16 16:15:33 |
| Nombre de la prueba | formato_moneda_util | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Utilidades UI / Formato Frontend | Ambiente | QA / Docker Live Services |
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
| Descripción | Evalúa la función de formateo monetario en pesos mexicanos con comas para millares y punto decimal. |
| Objetivo | Garantizar que montos numéricos o cadenas válidas se presenten correctamente en los componentes UI. |
| Precondiciones | Función de formato monetario disponible. |
| Datos de prueba | Entradas: 0, 1500, 2450000.5, '120.75', None, 'invalido' |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Formatear 0 (Cero) | $0.00 | $0.00 | ✓ |
| 2 | Formatear 1500 (Mil quinientos con coma) | $1,500.00 | $1,500.00 | ✓ |
| 3 | Formatear 2450000.5 (Millones con decimal) | $2,450,000.50 | $2,450,000.50 | ✓ |
| 4 | Formatear 120.75 (Cadena numérica) | $120.75 | $120.75 | ✓ |
| 5 | Formatear None (Valor nulo) | $0.00 | $0.00 | ✓ |
| 6 | Formatear invalido (Valor no convertible) | $0.00 | $0.00 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-004_formato_moneda_util_evidence.json](evidencias/usuario/CP-004_formato_moneda_util_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El formateador maneja casos borde y valores nulos con gracia. |
