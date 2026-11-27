# Pruebas Unitarias de Logica de Negocio y Machine Learning (tests/unit)

Este directorio contiene las dos suites de pruebas unitarias en frio ejecutadas en CI (`npm run test:ci`), con un total de **60 casos automatizados** sin dependencias externas.

---

## 1. Suite de Seguridad y Dominio de Boletos (`run-unit-tests.js` - 35 Casos)

Valida las funciones de `authValidation.js` y `ticketBusinessLogic.js`:

1. **Validacion de Correo y Registro (Casos 1-4)**: Formato valido, rechazo de correos malformados y deteccion de duplicidad.
2. **Seguridad de Contrasena (Casos 5-8)**: Longitud minima (8 caracteres), complejidad (mayusculas, minusculas, numeros y simbolos) y coincidencia de confirmacion.
3. **Inyeccion SQL, XSS y Sanitizacion (Casos 9-12)**: Deteccion de `' OR 1=1`, `DROP TABLE`, etiquetas `<script>` y limpieza de HTML/caracteres nulos.
4. **Estados de Boletos (Casos 13-18)**: `INVALID_CODE`, `VALID_ACCESS`, `ALREADY_REDEEMED`, `REVOKED_TICKET`, `TRANSFERRED_TICKET` y `PENDING_CLAIM`.
5. **Canje, Bloqueo de Asientos y Compras (Casos 19-25)**: Transicion a `used`, bloqueo de segundo canje, colision en `SeatLockManager`, carrito vacio, montos invalidos y `DOUBLE_PURCHASE_PREVENTED`.
6. **Pagos (Luhn/CVV), Transferencias y Vigencia de Eventos (Casos 26-35)**: Validacion Luhn de tarjeta, formato CVV, rechazo de autotransferencia (`SELF_TRANSFER_PROHIBITED`), bloqueo de transferencia de cortesias (`COURTESY_TRANSFER_FORBIDDEN`), boletos inactivos y rechazo de eventos concluidos.

---

## 2. Suite de Algoritmos ML, Big Data y MATIS BI (`run-ml-unit-tests.js` - 25 Casos)

Valida las funciones de `mlAnalyticsAlgorithms.js`:

1. **Regresion Lineal, R2, MAE y RMSE (Casos 1-5)**: Correlacion exacta, manejo de Cold Start (`insufficient_data`), dispersion estadistica, pendiente cero y conjuntos nulos.
2. **Arbol de Decision de Precios Dinamicos (Casos 6-9)**: Tarifa dinamica (+15% sobre >60% ocupacion), promocion (-15% en <30%), precio estable (30%-60%) y validacion de precios no positivos.
3. **Clustering K-Means y Distancia Euclidiana (Casos 10-13)**: Calculo de distancias, asignacion de centroides y calculo de SSE (Metodo del Codo).
4. **Deteccion de Anomalias y Bots (Casos 14-17)**: Clasificacion `SAFE`, rafagas (>4 tx/min), desviacion extrema de precio (`EXTREME_PRICE_DEVIATION`) y nivel `CRITICAL`.
5. **Prediccion de Churn y Fidelizacion (Casos 18-20)**: Riesgo `High` (>60 dias de inactividad con cupon de 15%), `Medium` (40 dias) y `Low`.
6. **Saneamiento KDD y Reconciliacion MATIS BI (Casos 21-25)**: Deduplicacion, imputacion de precios nulos y categorias vacias, reconciliacion de ingresos activos y exclusion contable de boletos cancelados.

---

## 3. Como Ejecutar

Desde la raiz del proyecto:
```bash
# Ejecutar ambas suites (60 casos, usado en CI/CD)
npm run test:ci

# Ejecutar de forma individual
npm run test:unit
npm run test:ml
```

O directamente con Node.js:
```bash
node tests/unit/run-unit-tests.js
node tests/unit/run-ml-unit-tests.js
```
