# REPORTE DE EJECUCIÓN Y EVIDENCIAS DE INTEGRACIÓN CONTINUA (CI)

**Proyecto:** Ecosistema LAIKA Club  
**Entregable:** Software funcional con integración continua, código fuente, repositorio, pruebas y pipeline ejecutado.  
**Fecha de Emisión:** 7 de noviembre de 2026  
**Resultado Global:** APROBADO (60 de 60 Casos Exitosos - 100.0% Tasa de Éxito)  
**Ambiente de Ejecución:** GitHub Actions Runner (Ubuntu 22.04 LTS / Node.js 18.x / OpenJDK 17)

---

## 1. RESUMEN EJECUTIVO DEL PIPELINE DE CI

La ejecución automatizada del pipeline de Integración Continua confirmó la solidez y estabilidad de los componentes desacoplados del sistema, sin registrar fallos de compilación ni regresiones en las capas transaccionales, analíticas o de seguridad.

| Métrica de Calidad | Resultado | Estado |
| :--- | :---: | :---: |
| **Pruebas de Seguridad & Dominio de Boletos** | 35 / 35 Pasadas | ✅ APROBADO |
| **Pruebas de ML, Detección de Anomalías & KDD** | 25 / 25 Pasadas | ✅ APROBADO |
| **Total de Pruebas Unitarias Automatizadas** | **60 / 60 Pasadas** | **✅ 100% PASS** |
| **Compilación Backend Java (Spring Boot)** | Maven Compile Clean | ✅ APROBADO |
| **Validación Sintáctica Docker Compose** | Sin errores de esquema | ✅ APROBADO |
| **Tiempo Total de Pipeline en CI** | ~1m 24s | ✅ ÓPTIMO |

---

## 2. DESGLOSE DETALLADO DE PRUEBAS UNITARIAS EJECUTADAS

### 2.1 Suite 1: Seguridad, Autenticación y Lógica de Negocio de Boletos (35 Casos)
Archivo fuente: [tests/unit/run-unit-tests.js](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/tests/unit/run-unit-tests.js)

```
===============================================================
   SUITE DE PRUEBAS UNITARIAS - LAIKA CLUB TEST RUNNER
===============================================================

--- GRUPO 1: VALIDACIÓN DE CORREO Y REGISTRO ---
  [PASS] #1 - Correo válido estándar debe ser aceptado
  [PASS] #2 - Correo sin @ o malformado debe ser rechazado
  [PASS] #3 - Detección de correo duplicado ya existente
  [PASS] #4 - Correo nuevo debe indicar disponibilidad

--- GRUPO 2: SEGURIDAD Y ROBUSTEZ DE CONTRASEÑA ---
  [PASS] #5 - Contraseña menor a 8 caracteres debe ser rechazada
  [PASS] #6 - Contraseña sin caracteres especiales debe fallar
  [PASS] #7 - Contraseña con mayúsculas, minúsculas, números y símbolos debe ser aprobada
  [PASS] #8 - Discrepancia en confirmación de contraseña debe ser bloqueada

--- GRUPO 3: CARACTERES PROHIBIDOS, XSS Y SQL INJECTION ---
  [PASS] #9 - Detección de inyección SQL clásica (" OR 1=1)
  [PASS] #10 - Detección de comando destructivo SQL DROP TABLE
  [PASS] #11 - Detección de vector XSS <script>
  [PASS] #12 - Sanitización remueve tags HTML y caracteres nulos

--- GRUPO 4: REGLAS DE NEGOCIO Y ESTADOS DE BOLETOS ---
  [PASS] #13 - Boleto nulo o inexistente retorna INVALID_CODE
  [PASS] #14 - Boleto activo autoriza acceso (VALID_ACCESS)
  [PASS] #15 - Boleto previamente canjeado rechaza reingreso (ALREADY_REDEEMED)
  [PASS] #16 - Boleto cancelado es denegado permanentemente (REVOKED_TICKET)
  [PASS] #17 - Boleto transferido invalida el QR original (TRANSFERRED_TICKET)
  [PASS] #18 - Cortesía no reclamada deniega acceso en puerta (PENDING_CLAIM)

--- GRUPO 5: COMPRAS, BLOQUEO DE ASIENTOS Y DOBLE COMPRA ---
  [PASS] #19 - Canje exitoso cambia estado a used y registra operador
  [PASS] #20 - Segundo intento de canje consecutivo es bloqueado
  [PASS] #21 - Usuario A aparta exitosamente el asiento A-12
  [PASS] #22 - Usuario B es bloqueado al intentar apartar asiento ocupado
  [PASS] #23 - Intento de compra con carrito vacío es rechazado
  [PASS] #24 - Compra con precio negativo o nulo es rechazada
  [PASS] #25 - Intento de compra de un asiento ya vendido previene doble compra (DOUBLE_PURCHASE_PREVENTED)

--- GRUPO 6: TARJETAS (LUHN), TRANSFERENCIAS Y EVENTOS CONCLUIDOS ---
  [PASS] #26 - Tarjeta de crédito con checksum Luhn válido es aceptada (4532015112830366)
  [PASS] #27 - Tarjeta con checksum Luhn alterado o erróneo es rechazada (4532015112830367)
  [PASS] #28 - Tarjeta con menos de 13 dígitos o letras es rechazada
  [PASS] #29 - CVV de 3 y 4 dígitos es válido, mientras que valores alfanuméricos o cortos son rechazados
  [PASS] #30 - Transferencia dirigida al mismo remitente es rechazada (SELF_TRANSFER_PROHIBITED)
  [PASS] #31 - Transferencia de boleto de cortesía es rechazada (COURTESY_TRANSFER_FORBIDDEN)
  [PASS] #32 - Transferencia de un boleto ya utilizado es rechazada (INACTIVE_TICKET)
  [PASS] #33 - Transferencia legítima de boleto activo entre distintos usuarios es autorizada
  [PASS] #34 - Evento con fecha concluida en el pasado es rechazado para transacciones
  [PASS] #35 - Evento con fecha futura vigente es elegible para compra de boletos

TOTAL DE PRUEBAS EJECUTADAS: 35 | APROBADAS: 35 | FALLIDAS: 0 | ÉXITO: 100.0%
```

---

### 2.2 Suite 2: Machine Learning, Analítica y Detección de Anomalías (25 Casos)
Archivo fuente: [tests/unit/run-ml-unit-tests.js](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/tests/unit/run-ml-unit-tests.js)

```
===============================================================
   SUITE DE PRUEBAS UNITARIAS - ML & BIG DATA ENGINE
===============================================================

--- GRUPO 1: REGRESIÓN LINEAL, R², MAE Y RMSE ---
  [PASS] #1 - Regresión lineal con correlación perfecta debe dar R² = 1.0
  [PASS] #2 - Manejo seguro de Cold Start (insufficient_data con < 2 puntos)
  [PASS] #3 - MAE y RMSE deben ser mayores a cero ante dispersión estadística
  [PASS] #4 - Línea constante debe calcular pendiente cero e intercepto = 100
  [PASS] #5 - Conjunto nulo no debe generar excepción fatal y retornar status de datos insuficientes

--- GRUPO 2: ÁRBOL DE DECISIÓN Y POLÍTICA DE PRECIOS DINÁMICOS ---
  [PASS] #6 - Ocupación > 60% y precio premium recomienda Tarifa Dinámica (+15%)
  [PASS] #7 - Ocupación < 30% recomienda Promoción / Descuento Flash (-15%)
  [PASS] #8 - Ocupación intermedia (30%-60%) mantiene Precio Estable
  [PASS] #9 - Precio base no positivo es rechazado con clasificación Inválido

--- GRUPO 3: CLUSTERING K-MEANS Y DISTANCIA EUCLIDIANA ---
  [PASS] #10 - Distancia Euclidiana 2D en triángulo 3-4-5 debe ser exactamente 5.0
  [PASS] #11 - Distancia entre puntos idénticos multidimensionales debe ser cero
  [PASS] #12 - Punto [1,1] asignado a Clúster 0 y [9,9] a Clúster 1
  [PASS] #13 - SSE de clústeres debe ser estrictamente positivo para puntos dispersos

--- GRUPO 4: DETECCIÓN DE ANOMALÍAS Y TRÁFICO DE BOTS ---
  [PASS] #14 - Transacción humana estándar es clasificada como SAFE (sin anomalía)
  [PASS] #15 - Ráfaga de compras (>4 tx/min) eleva score y dispara alerta de bot
  [PASS] #16 - Precio 3.5x superior al precio base dispara bandera EXTREME_PRICE_DEVIATION
  [PASS] #17 - Tráfico masivo concurrente con BIN foráneo alcanza nivel CRITICAL

--- GRUPO 5: PREDICCIÓN DE CHURN Y FIDELIZACIÓN ---
  [PASS] #18 - Inactividad >60 días clasifica en riesgo High y activa cupón de 15%
  [PASS] #19 - Inactividad de 40 días clasifica en riesgo Medium sin descuento flash
  [PASS] #20 - Usuario con actividad reciente clasifica en riesgo Low (retenido)

--- GRUPO 6: SANEAMIENTO KDD Y RECONCILIACIÓN MATIS BI ---
  [PASS] #21 - Saneamiento KDD elimina duplicados conservando registros únicos
  [PASS] #22 - Precios nulos son imputados con el valor por defecto ($50.0)
  [PASS] #23 - Categoría vacía es imputada con valor estándar "General"
  [PASS] #24 - MATIS: Reconciliación exacta entre boletos activos y cobros bancarios
  [PASS] #25 - Boletos cancelados no se suman a los ingresos, manteniendo balance contable

TOTAL DE PRUEBAS EJECUTADAS: 25 | APROBADAS: 25 | FALLIDAS: 0 | ÉXITO: 100.0%
```

---

## 3. AUDITORÍA DE COMPILACIÓN Y CONTENEDORES

1. **Microservicios Java Spring Boot:**
   - Compilación exitosa de artefactos con Maven sin errores de dependencias cíclicas (`BUILD SUCCESS`).
   - Prueba unitaria de servicio de cancelaciones (`CancellationServiceImplTest`) superada con 0 fallos.
2. **Validación de Docker Compose:**
   - Verificación sintáctica con `docker compose config -q` superada sin colisiones de nombres de red o puertos duplicados.

---

## 4. CONCLUSIÓN DE EVALUACIÓN (HITO 1)

El software cumple íntegramente con los requisitos del primer hito:
* Código fuente versionado y estructurado con estrategia GitFlow.
* Compilación y ejecución de pruebas 100% automatizadas.
* Pipeline de Integración Continua activo, validado y auditable en GitHub Actions.

