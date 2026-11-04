/**
 * SIMULADOR DE CONCURRENCIA Y CARGA - ANALÍTICA BIG DATA & ML
 * Simula 20 solicitudes concurrentes compitiendo en paralelo sobre los endpoints
 * analíticos y de machine learning para validar resiliencia y tiempos de respuesta.
 *
 * Uso: node tests/performance/simulate_ml_analytics_load.js
 */

const BASE_URL = process.env.LAIKA_GATEWAY_URL || 'http://localhost:8000';
const ANALYTICS_URL = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8007';

const TARGET_ENDPOINTS = [
    '/api/analytics/tables',
    '/api/analytics/ml/regression',
    '/api/analytics/ml/decision-tree',
    '/api/analytics/ml/prospecting',
    '/api/analytics/ml/user-behavior',
    '/api/analytics/3d?table=tickets'
];

async function singleQuery(id, endpoint) {
    const start = Date.now();
    const urls = [`${BASE_URL}${endpoint}`, `${ANALYTICS_URL}${endpoint}`];

    for (const url of urls) {
        try {
            const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
            const duration = Date.now() - start;
            return { id, endpoint, status: res.status, duration, success: res.ok };
        } catch (err) {
            // Continúa intentando con el siguiente puerto de contingencia
        }
    }
    const duration = Date.now() - start;
    return { id, endpoint, status: 0, duration, success: false, error: 'Connection refused or timeout' };
}

async function runStressTest(totalQueries = 20) {
    console.log('\n===============================================================');
    console.log(`   PRUEBA DE CONCURRENCIA Y ESTRÉS: ANALYTICS & ML (${totalQueries} RÁFAGAS)`);
    console.log(`   Destino: ${BASE_URL} / ${ANALYTICS_URL}`);
    console.log('===============================================================\n');

    const promises = [];
    const startTime = Date.now();

    for (let i = 1; i <= totalQueries; i++) {
        const ep = TARGET_ENDPOINTS[i % TARGET_ENDPOINTS.length];
        promises.push(singleQuery(i, ep));
    }

    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;

    let successful = 0;
    let failed = 0;
    let totalDuration = 0;

    results.forEach(r => {
        if (r.success) successful++;
        else failed++;
        totalDuration += r.duration;
        console.log(`  [REQ #${r.id.toString().padStart(2, '0')}] ${r.endpoint.padEnd(35)} -> ${r.success ? 'OK (200)' : 'FAIL/OFFLINE'} | ${r.duration}ms`);
    });

    const avgDuration = Math.round(totalDuration / totalQueries);

    console.log('\n===============================================================');
    console.log(`TOTAL SOLICITUDES:     ${totalQueries}`);
    console.log(`EXITOSAS:              ${successful}`);
    console.log(`FALLIDAS / OFFLINE:    ${failed}`);
    console.log(`TIEMPO TOTAL RÁFAGA:   ${totalTime}ms`);
    console.log(`LATENCIA PROMEDIO:     ${avgDuration}ms por petición`);
    console.log('===============================================================\n');
}

if (require.main === module) {
    runStressTest(20);
}

module.exports = { runStressTest };

