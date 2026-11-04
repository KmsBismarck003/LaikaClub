/**
 * EJECUTOR DE PRUEBAS UNITARIAS DE MACHINE LEARNING Y BIG DATA
 * Valida 25 casos algorítmicos cubriendo:
 * - Regresión Lineal, Métricas R², MAE, RMSE y Cold Start
 * - Árboles de Decisión de Precios Dinámicos y Sensibilidad
 * - Clustering K-Means, Distancia Euclidiana y SSE del Método del Codo
 * - Isolation Forest, Detección de Anomalías y Tráfico de Bots
 * - Predicción de Churn, Scoring RFM y Emisión de Cupones
 * - Saneamiento de Datos KDD (Deduplicación e Imputación)
 * - Reconciliación de Balances de Negocio en MATIS BI
 *
 * Uso: node tests/unit/run-ml-unit-tests.js
 */

const {
    calculateLinearRegression,
    classifyEventPricing,
    euclideanDistance,
    assignClusters,
    calculateClusterSSE,
    evaluateBotTransactionRisk,
    evaluateUserChurnRisk,
    sanitizeDataset,
    reconcileMatisFinancialTotals
} = require('./mlAnalyticsAlgorithms');

const results = [];
let passCount = 0;
let failCount = 0;

function assert(description, condition, details = '') {
    if (condition) {
        passCount++;
        results.push({ id: results.length + 1, status: 'PASSED', description });
        console.log(`  [PASS] #${results.length} - ${description}`);
    } else {
        failCount++;
        results.push({ id: results.length + 1, status: 'FAILED', description, details });
        console.error(`  [FAIL] #${results.length} - ${description} (Detalles: ${details})`);
    }
}

console.log('\n===============================================================');
console.log('   SUITE DE PRUEBAS UNITARIAS - ML & BIG DATA ENGINE');
console.log('===============================================================\n');

// -------------------------------------------------------------
// GRUPO 1: REGRESIÓN LINEAL Y MÉTRICAS DE PREDICCIÓN (Pruebas 1 a 5)
// -------------------------------------------------------------
console.log('--- GRUPO 1: REGRESIÓN LINEAL, R², MAE Y RMSE ---');

// Caso 1: Regresión con pendiente positiva perfecta
const perfectPoints = [{ x: 1, y: 10 }, { x: 2, y: 20 }, { x: 3, y: 30 }, { x: 4, y: 40 }];
const reg1 = calculateLinearRegression(perfectPoints);
assert('Regresión lineal con correlación perfecta debe dar R² = 1.0', reg1.r2 === 1.0 && reg1.slope === 10);

// Caso 2: Manejo de Cold Start (datos insuficientes < 2 puntos)
const coldStartPoints = [{ x: 5, y: 50 }];
const regCold = calculateLinearRegression(coldStartPoints);
assert('Manejo seguro de Cold Start (insufficient_data con < 2 puntos)', regCold.status === 'insufficient_data');

// Caso 3: Errores MAE y RMSE finitos ante ruido
const noisyPoints = [{ x: 1, y: 12 }, { x: 2, y: 18 }, { x: 3, y: 31 }, { x: 4, y: 39 }];
const regNoisy = calculateLinearRegression(noisyPoints);
assert('MAE y RMSE deben ser mayores a cero ante dispersión estadística', regNoisy.mae > 0 && regNoisy.rmse > 0 && regNoisy.r2 > 0.95);

// Caso 4: Línea horizontal (pendiente cero)
const flatPoints = [{ x: 1, y: 100 }, { x: 2, y: 100 }, { x: 3, y: 100 }];
const regFlat = calculateLinearRegression(flatPoints);
assert('Línea constante debe calcular pendiente cero e intercepto = 100', regFlat.slope === 0 && regFlat.intercept === 100);

// Caso 5: Conjunto vacío o nulo
const regEmpty = calculateLinearRegression(null);
assert('Conjunto nulo no debe generar excepción fatal y retornar status de datos insuficientes', regEmpty.status === 'insufficient_data');

// -------------------------------------------------------------
// GRUPO 2: ÁRBOL DE DECISIÓN Y TARIFAS DINÁMICAS (Pruebas 6 a 9)
// -------------------------------------------------------------
console.log('\n--- GRUPO 2: ÁRBOL DE DECISIÓN Y POLÍTICA DE PRECIOS DINÁMICOS ---');

// Caso 6: Alta ocupación activa tarifa dinámica (+15%)
const dtDynamic = classifyEventPricing(75.0, 500.0, 1.2);
assert('Ocupación > 60% y precio premium recomienda Tarifa Dinámica (+15%)', dtDynamic.classification === 'Tarifa Dinámica' && dtDynamic.suggestedPrice === 575.0);

// Caso 7: Baja ocupación recomienda promoción o descuento flash (-15%)
const dtPromo = classifyEventPricing(20.0, 400.0, 0.4);
assert('Ocupación < 30% recomienda Promoción / Descuento Flash (-15%)', dtPromo.classification === 'Promoción / Descuento' && dtPromo.suggestedPrice === 340.0);

// Caso 8: Ocupación promedio mantiene precio estable
const dtStable = classifyEventPricing(45.0, 400.0, 1.0);
assert('Ocupación intermedia (30%-60%) mantiene Precio Estable', dtStable.classification === 'Precio Estable' && dtStable.multiplier === 1.0);

// Caso 9: Eventos con precio base no positivo o nulo
const dtInvalid = classifyEventPricing(80.0, 0);
assert('Precio base no positivo es rechazado con clasificación Inválido', dtInvalid.classification === 'Inválido');

// -------------------------------------------------------------
// GRUPO 3: K-MEANS, DISTANCIAS Y MÉTODO DEL CODO (Pruebas 10 a 13)
// -------------------------------------------------------------
console.log('\n--- GRUPO 3: CLUSTERING K-MEANS Y DISTANCIA EUCLIDIANA ---');

// Caso 10: Distancia euclidiana básica 2D
const dist1 = euclideanDistance([0, 0], [3, 4]);
assert('Distancia Euclidiana 2D en triángulo 3-4-5 debe ser exactamente 5.0', dist1 === 5.0);

// Caso 11: Distancia euclidiana en dimensiones idénticas es cero
const distZero = euclideanDistance([10, 20, 30], [10, 20, 30]);
assert('Distancia entre puntos idénticos multidimensionales debe ser cero', distZero === 0);

// Caso 12: Asignación al clúster más cercano
const centroids = [[0, 0], [10, 10]];
const points = [[1, 1], [9, 9]];
const assignments = assignClusters(points, centroids);
assert('Punto [1,1] asignado a Clúster 0 y [9,9] a Clúster 1', assignments[0].cluster === 0 && assignments[1].cluster === 1);

// Caso 13: Cálculo de Suma de Errores al Cuadrado (SSE)
const sse = calculateClusterSSE(assignments, centroids);
assert('SSE de clústeres debe ser estrictamente positivo para puntos dispersos', sse > 0);

// -------------------------------------------------------------
// GRUPO 4: DETECCIÓN DE ANOMALÍAS, BOTS Y REVENTA (Pruebas 14 a 17)
// -------------------------------------------------------------
console.log('\n--- GRUPO 4: DETECCIÓN DE ANOMALÍAS Y TRÁFICO DE BOTS ---');

// Caso 14: Usuario legítimo con velocidad estándar
const safeTx = evaluateBotTransactionRisk({ requestsPerMinute: 1, priceDeviationRatio: 1.0, sameCardAttempts: 1, hasForeignBin: false });
assert('Transacción humana estándar es clasificada como SAFE (sin anomalía)', !safeTx.isAnomaly && safeTx.level === 'SAFE');

// Caso 15: Bot de alta velocidad detectado (>3 tx/minuto)
const botTx = evaluateBotTransactionRisk({ requestsPerMinute: 6, priceDeviationRatio: 1.0, sameCardAttempts: 4, hasForeignBin: false });
assert('Ráfaga de compras (>4 tx/min) eleva score y dispara alerta de bot', botTx.isAnomaly && botTx.flags.includes('HIGH_VELOCITY_PURCHASE'));

// Caso 16: Desviación extrema de precio por reventa o manipulación
const priceAnomaly = evaluateBotTransactionRisk({ requestsPerMinute: 1, priceDeviationRatio: 3.5, sameCardAttempts: 1, hasForeignBin: false });
assert('Precio 3.5x superior al precio base dispara bandera EXTREME_PRICE_DEVIATION', priceAnomaly.flags.includes('EXTREME_PRICE_DEVIATION'));

// Caso 17: Escenario crítico combinado (Bot masivo internacional)
const criticalAnomaly = evaluateBotTransactionRisk({ requestsPerMinute: 5, priceDeviationRatio: 4.0, sameCardAttempts: 5, hasForeignBin: true });
assert('Tráfico masivo concurrente con BIN foráneo alcanza nivel CRITICAL', criticalAnomaly.level === 'CRITICAL' && criticalAnomaly.riskScore >= 75);

// -------------------------------------------------------------
// GRUPO 5: SCORING DE ABANDONO (CHURN) Y RFM (Pruebas 18 a 20)
// -------------------------------------------------------------
console.log('\n--- GRUPO 5: PREDICCIÓN DE CHURN Y FIDELIZACIÓN ---');

// Caso 18: Inactividad severa (>60 días) clasifica en Churn Alto
const churnHigh = evaluateUserChurnRisk(75, 80, 4, 1200);
assert('Inactividad >60 días clasifica en riesgo High y activa cupón de 15%', churnHigh.riskLevel === 'High' && churnHigh.discountEligible === true);

// Caso 19: Inactividad intermedia (30 a 59 días)
const churnMed = evaluateUserChurnRisk(40, 35, 2, 450);
assert('Inactividad de 40 días clasifica en riesgo Medium sin descuento flash', churnMed.riskLevel === 'Medium' && churnMed.discountEligible === false);

// Caso 20: Usuario recurrente reciente (<30 días)
const churnLow = evaluateUserChurnRisk(5, 10, 8, 3200);
assert('Usuario con actividad reciente clasifica en riesgo Low (retenido)', churnLow.riskLevel === 'Low' && churnLow.actionRequired === 'NINGUNA');

// -------------------------------------------------------------
// GRUPO 6: SANEAMIENTO KDD Y RECONCILIACIÓN MATIS (Pruebas 21 a 25)
// -------------------------------------------------------------
console.log('\n--- GRUPO 6: SANEAMIENTO KDD Y RECONCILIACIÓN MATIS BI ---');

// Caso 21: Eliminación de duplicados por ID
const dirtyData = [{ id: 1, price: 100 }, { id: 1, price: 100 }, { id: 2, price: 200 }];
const cleanRes = sanitizeDataset(dirtyData);
assert('Saneamiento KDD elimina duplicados conservando registros únicos', cleanRes.duplicatesRemoved === 1 && cleanRes.cleanedRows.length === 2);

// Caso 22: Imputación de precios nulos o cero
const nullPriceData = [{ id: 10, price: null, category: 'VIP' }];
const cleanImputed = sanitizeDataset(nullPriceData, 50.0);
assert('Precios nulos son imputados con el valor por defecto ($50.0)', cleanImputed.cleanedRows[0].price === 50.0 && cleanImputed.nullsImputed === 1);

// Caso 23: Imputación de categoría vacía
const nullCatData = [{ id: 11, price: 80, category: '' }];
const cleanCat = sanitizeDataset(nullCatData, 50.0, 'General');
assert('Categoría vacía es imputada con valor estándar "General"', cleanCat.cleanedRows[0].category === 'General');

// Caso 24: Reconciliación financiera exitosa en MATIS BI (Boletos = Cobros)
const tickets = [{ id: 1, price: 150, status: 'active' }, { id: 2, price: 250, status: 'confirmed' }];
const payments = [{ id: 101, amount: 400, status: 'completed' }];
const reconBalanced = reconcileMatisFinancialTotals(tickets, payments);
assert('MATIS: Reconciliación exacta entre boletos activos y cobros bancarios', reconBalanced.isBalanced && reconBalanced.discrepancy === 0);

// Caso 25: Detección de descuadre financiero por boletos cancelados
const ticketsWithCancelled = [
    { id: 1, price: 150, status: 'active' },
    { id: 2, price: 250, status: 'cancelled' } // No debe sumar
];
const paymentsSingle = [{ id: 101, amount: 150, status: 'completed' }];
const reconWithCancel = reconcileMatisFinancialTotals(ticketsWithCancelled, paymentsSingle);
assert('Boletos cancelados no se suman a los ingresos, manteniendo balance contable', reconWithCancel.isBalanced && reconWithCancel.totalTicketIncome === 150);

console.log('\n===============================================================');
console.log(`TOTAL DE PRUEBAS EJECUTADAS: ${results.length}`);
console.log(`APROBADAS (PASSED):          ${passCount}`);
console.log(`FALLIDAS  (FAILED):          ${failCount}`);
console.log(`TASA DE ÉXITO:               ${((passCount / results.length) * 100).toFixed(1)}%`);
console.log('===============================================================\n');

if (failCount > 0) {
    process.exit(1);
} else {
    process.exit(0);
}

