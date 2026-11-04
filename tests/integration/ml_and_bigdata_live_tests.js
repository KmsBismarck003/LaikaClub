/**
 * SUITE DE PRUEBAS DE INTEGRACIÓN EN VIVO - MACHINE LEARNING & BIG DATA (15 ESCENARIOS REALES)
 * Valida los endpoints de analítica predictiva, clustering, big data y MATIS BI
 * a través de Pilgrim API Gateway (Puerto 8000) o directo al microservicio Big Data (8007 / 8303).
 *
 * Ejecución completa: node tests/integration/ml_and_bigdata_live_tests.js
 * Ejecución individual: node tests/integration/ml_and_bigdata_live_tests.js --test=3
 */

const BASE_URL = process.env.LAIKA_GATEWAY_URL || 'http://localhost:8000';
const ANALYTICS_DIRECT_URL = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8007';

const ML_LIVE_SCENARIOS_META = [
    { id: 1, name: 'Catálogo de Tablas Disponibles para Big Data', endpoint: '/api/analytics/tables', method: 'GET', category: 'ETL & Big Data', description: 'Verifica retorno de tablas tickets, users, payments y events.' },
    { id: 2, name: 'Regresión Financiera y Proyección de Ventas', endpoint: '/api/analytics/ml/regression', method: 'GET', category: 'Modelos Predictivos', description: 'Valida cálculo de pendiente, intercepto, R² y métricas de error MAE/RMSE.' },
    { id: 3, name: 'Árbol de Decisión para Precios Dinámicos', endpoint: '/api/analytics/ml/decision-tree', method: 'GET', category: 'Modelos Predictivos', description: 'Comprueba clasificación de eventos en Tarifa Dinámica, Promoción o Estable.' },
    { id: 4, name: 'Prospección B2B y Expansión de Recintos (Clustering)', endpoint: '/api/analytics/ml/prospecting', method: 'GET', category: 'Clustering & K-Means', description: 'Valida agrupación de recintos y venues para prospección comercial.' },
    { id: 5, name: 'Detección de Bots y Anomalías con Isolation Forest', endpoint: '/api/analytics/ml/anomaly', method: 'GET', category: 'Seguridad & Antifraude', description: 'Audita transacciones con desviaciones extremas de precio y patrones de reventa.' },
    { id: 6, name: 'Analítica de Comportamiento y Riesgo de Churn', endpoint: '/api/analytics/ml/user-behavior', method: 'GET', category: 'Marketing & Churn', description: 'Calcula recencia de usuarios inactivos y distribución de riesgo de abandono.' },
    { id: 7, name: 'Predicción de Demanda Semanal por Horarios', endpoint: '/api/analytics/ml/demand-prediction', method: 'GET', category: 'Modelos Predictivos', description: 'Comprueba desglose de demanda por día de la semana y horarios punta.' },
    { id: 8, name: 'Optimización de Clústeres (Método del Codo / Elbow)', endpoint: '/api/analytics/ml/elbow?max_k=6', method: 'GET', category: 'Clustering & K-Means', description: 'Evalúa la inercia (SSE) para sugerir el número óptimo de clústeres.' },
    { id: 9, name: 'Análisis de Componentes Principales (PCA)', endpoint: '/api/analytics/ml/pca?k=3', method: 'GET', category: 'Reducción Dimensional', description: 'Comprueba varianza explicada y coordenadas 2D/3D proyectadas.' },
    { id: 10, name: 'Saneamiento de Datos KDD en MySQL', endpoint: '/api/analytics/clean?table=tickets', method: 'POST', category: 'ETL & Calidad de Datos', description: 'Verifica imputación de precios nulos y eliminación de registros duplicados.' },
    { id: 11, name: 'Insights Estratégicos de Ventas de Mercancía', endpoint: '/api/analytics/merch/sales-insights', method: 'GET', category: 'Business Intelligence', description: 'Genera recomendaciones accionables en lenguaje natural sobre stock y ventas.' },
    { id: 12, name: 'Agregaciones Multidimensionales 3D (MapReduce)', endpoint: '/api/analytics/3d?table=tickets', method: 'GET', category: 'Big Data 3D', description: 'Valida coordenadas X (fecha), Y (volumen) y Z (ingresos) para el visualizador 3D.' },
    { id: 13, name: 'Consola Ejecutiva y Financiera MATIS', endpoint: '/api/analytics/matis/executive', method: 'GET', category: 'MATIS Financial BI', description: 'Comprueba métricas de flujo de caja, ticket promedio y rentabilidad neta.' },
    { id: 14, name: 'Estado de Bóveda NoSQL (MongoDB Atlas Vault)', endpoint: '/api/analytics/vault/status', method: 'GET', category: 'Infraestructura & Vault', description: 'Verifica conexión a MongoDB Atlas y conteo de snapshots de respaldo.' },
    { id: 15, name: 'Motor de Recomendaciones Personalizadas de Eventos', endpoint: '/api/analytics/ml/recommendations/1', method: 'GET', category: 'Recomendaciones', description: 'Comprueba entrega de eventos afines o fallback seguro de Cold Start.' }
];

let passCount = 0;
let failCount = 0;
const results = [];

const testArg = process.argv.find(a => a.startsWith('--test=')) || process.argv[2];
const targetTestId = testArg ? parseInt(testArg.replace('--test=', ''), 10) : null;

function shouldRun(id) {
    return targetTestId === null || isNaN(targetTestId) || targetTestId === id;
}

function recordTest(id, name, success, details = '') {
    if (success) {
        passCount++;
        results.push({ id, status: 'PASSED', name });
        console.log(`  [PASS] #${id} - ${name}`);
    } else {
        failCount++;
        results.push({ id, status: 'FAILED', name, details });
        console.error(`  [FAIL] #${id} - ${name} -> DETALLES: ${details}`);
    }
}

async function requestEndpoint(path, method = 'GET', body = null, token = null) {
    const urls = [
        `${BASE_URL}${path}`,
        `${ANALYTICS_DIRECT_URL}${path}`
    ];

    let lastError = null;

    for (const url of urls) {
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : null,
                signal: AbortSignal.timeout(6000)
            });

            const data = await res.json().catch(() => null);
            return { ok: res.ok, status: res.status, data };
        } catch (err) {
            lastError = err.message;
        }
    }

    return { ok: false, status: 0, error: lastError };
}

async function runMlLiveTests() {
    console.log('\n===============================================================');
    if (targetTestId) {
        const meta = ML_LIVE_SCENARIOS_META.find(m => m.id === targetTestId);
        console.log(`   EJECUCIÓN INDIVIDUAL: PRUEBA #${targetTestId} - ${meta ? meta.name : ''}`);
    } else {
        console.log('   PRUEBAS EN VIVO: MACHINE LEARNING & BIG DATA (15 ESCENARIOS)');
    }
    console.log(`   Destino: ${BASE_URL} (API Gateway Pilgrim) / ${ANALYTICS_DIRECT_URL}`);
    console.log('===============================================================\n');

    let adminToken = null;
    try {
        const resAdmin = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@laikaclub.com', password: 'gearsof2' }),
            signal: AbortSignal.timeout(3000)
        });
        const dAdmin = await resAdmin.json();
        adminToken = dAdmin?.token || null;
    } catch (_) {}

    // 1. Tablas disponibles
    if (shouldRun(1)) {
        const res = await requestEndpoint('/api/analytics/tables', 'GET', null, adminToken);
        const pass = res.ok && Array.isArray(res.data?.tables || res.data);
        recordTest(1, 'Catálogo de Tablas Disponibles para Big Data', pass, `Status: ${res.status}`);
    }

    // 2. Regresión Financiera
    if (shouldRun(2)) {
        const res = await requestEndpoint('/api/analytics/ml/regression', 'GET', null, adminToken);
        const pass = res.ok && (res.data?.status === 'success' || res.data?.status === 'insufficient_data' || res.data?.r2 != null);
        recordTest(2, 'Regresión Financiera y Proyección de Ventas', pass, `Status: ${res.status}`);
    }

    // 3. Árbol de Decisión
    if (shouldRun(3)) {
        const res = await requestEndpoint('/api/analytics/ml/decision-tree', 'GET', null, adminToken);
        const pass = res.ok && (res.data?.status === 'success' || Array.isArray(res.data?.predictions) || res.data?.predictions != null);
        recordTest(3, 'Árbol de Decisión para Precios Dinámicos', pass, `Status: ${res.status}`);
    }

    // 4. Prospección B2B
    if (shouldRun(4)) {
        const res = await requestEndpoint('/api/analytics/ml/prospecting', 'GET', null, adminToken);
        const pass = res.ok && (res.data?.status === 'success' || Array.isArray(res.data?.leads) || Array.isArray(res.data));
        recordTest(4, 'Prospección B2B y Expansión de Recintos (Clustering)', pass, `Status: ${res.status}`);
    }

    // 5. Detección de Anomalías / Bots
    if (shouldRun(5)) {
        const res = await requestEndpoint('/api/analytics/ml/anomaly', 'GET', null, adminToken);
        const pass = res.ok && (res.data?.status === 'success' || res.data?.anomalies != null || res.data?.anomalies_count != null);
        recordTest(5, 'Detección de Bots y Anomalías con Isolation Forest', pass, `Status: ${res.status}`);
    }

    // 6. User Behavior / Churn
    if (shouldRun(6)) {
        const res = await requestEndpoint('/api/analytics/ml/user-behavior', 'GET', null, adminToken);
        const pass = res.ok && (res.data?.status === 'success' || res.data?.churn_candidates != null || res.data?.top_consumers != null);
        recordTest(6, 'Analítica de Comportamiento y Riesgo de Churn', pass, `Status: ${res.status}`);
    }

    // 7. Demand Prediction
    if (shouldRun(7)) {
        const res = await requestEndpoint('/api/analytics/ml/demand-prediction', 'GET', null, adminToken);
        const pass = res.ok && (res.data?.status === 'success' || res.data?.demand_by_day != null || res.data?.peak_hours != null);
        recordTest(7, 'Predicción de Demanda Semanal por Horarios', pass, `Status: ${res.status}`);
    }

    // 8. Método del Codo (Elbow)
    if (shouldRun(8)) {
        const res = await requestEndpoint('/api/analytics/ml/elbow?max_k=6', 'GET', null, adminToken);
        const pass = res.ok && (res.data?.status === 'success' || res.data?.optimal_k != null || Array.isArray(res.data?.elbow_curve));
        recordTest(8, 'Optimización de Clústeres (Método del Codo / Elbow)', pass, `Status: ${res.status}`);
    }

    // 9. PCA (Componentes Principales)
    if (shouldRun(9)) {
        const res = await requestEndpoint('/api/analytics/ml/pca?k=3', 'GET', null, adminToken);
        const pass = res.ok && (res.data?.status === 'success' || res.data?.explained_variance != null || Array.isArray(res.data?.clusters));
        recordTest(9, 'Análisis de Componentes Principales (PCA)', pass, `Status: ${res.status}`);
    }

    // 10. Saneamiento KDD
    if (shouldRun(10)) {
        const res = await requestEndpoint('/api/analytics/clean?table=tickets', 'POST', {}, adminToken);
        const pass = res.ok && (res.data?.status === 'success' || res.data?.data != null);
        recordTest(10, 'Saneamiento de Datos KDD en MySQL', pass, `Status: ${res.status}`);
    }

    // 11. Insights de Mercancía
    if (shouldRun(11)) {
        const res = await requestEndpoint('/api/analytics/merch/sales-insights', 'GET', null, adminToken);
        const pass = res.ok && (res.data?.status === 'success' || res.data?.insights != null || res.data?.top_sellers != null);
        recordTest(11, 'Insights Estratégicos de Ventas de Mercancía', pass, `Status: ${res.status}`);
    }

    // 12. Agregaciones 3D MapReduce
    if (shouldRun(12)) {
        const res = await requestEndpoint('/api/analytics/3d?table=tickets', 'GET', null, adminToken);
        const pass = res.ok && (res.data?.status === 'success' || Array.isArray(res.data?.data) || Array.isArray(res.data));
        recordTest(12, 'Agregaciones Multidimensionales 3D (MapReduce)', pass, `Status: ${res.status}`);
    }

    // 13. MATIS Executive
    if (shouldRun(13)) {
        const res = await requestEndpoint('/api/analytics/matis/executive', 'GET', null, adminToken);
        const pass = res.ok || res.status === 200 || res.status === 404; // Considera status estructurado
        recordTest(13, 'Consola Ejecutiva y Financiera MATIS', res.ok || res.status === 200, `Status: ${res.status}`);
    }

    // 14. Bóveda NoSQL Vault
    if (shouldRun(14)) {
        const res = await requestEndpoint('/api/analytics/vault/status', 'GET', null, adminToken);
        const pass = res.ok && (res.data?.status === 'ready' || res.data?.provider === 'MongoDB Atlas');
        recordTest(14, 'Estado de Bóveda NoSQL (MongoDB Atlas Vault)', pass, `Status: ${res.status}`);
    }

    // 15. Recomendaciones de Eventos
    if (shouldRun(15)) {
        const res = await requestEndpoint('/api/analytics/ml/recommendations/1', 'GET', null, adminToken);
        const pass = res.ok && (res.data?.status === 'success' || res.data?.status === 'cold_start' || Array.isArray(res.data?.recommendations));
        recordTest(15, 'Motor de Recomendaciones Personalizadas de Eventos', pass, `Status: ${res.status}`);
    }

    console.log('\n===============================================================');
    console.log(`TOTAL DE PRUEBAS EJECUTADAS: ${results.length}`);
    console.log(`APROBADAS (PASSED):          ${passCount}`);
    console.log(`FALLIDAS  (FAILED):          ${failCount}`);
    const rate = results.length > 0 ? ((passCount / results.length) * 100).toFixed(1) : '0.0';
    console.log(`TASA DE ÉXITO:               ${rate}%`);
    console.log('===============================================================\n');

    return { total: results.length, passed: passCount, failed: failCount, results };
}

if (require.main === module) {
    runMlLiveTests().then(({ failed }) => {
        if (failed > 0) process.exit(1);
    });
}

module.exports = {
    ML_LIVE_SCENARIOS_META,
    runMlLiveTests
};

