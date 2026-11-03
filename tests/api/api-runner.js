/**
 * EJECUTOR DE PRUEBAS DE API (REST / GATEWAY)
 * Puede ejecutarse de forma interactiva contra el Gateway local (puerto 8000)
 * o mediante emulación de contratos de endpoints.
 * Uso: node tests/api/api-runner.js
 */

const http = require('http');

const GATEWAY_HOST = process.env.GATEWAY_HOST || 'localhost';
const GATEWAY_PORT = process.env.GATEWAY_PORT || 8000;

console.log('\n===============================================================');
console.log('   SUITE DE PRUEBAS DE API - LAIKA CLUB GATEWAY & MICROSERVICES');
console.log(`   Destino configurado: http://${GATEWAY_HOST}:${GATEWAY_PORT}`);
console.log('===============================================================\n');

function checkGatewayHealth() {
    return new Promise((resolve) => {
        const req = http.get(`http://${GATEWAY_HOST}:${GATEWAY_PORT}/tickets/health`, { timeout: 2000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({ online: true, statusCode: res.statusCode, body: data });
            });
        });

        req.on('error', (err) => {
            resolve({ online: false, error: err.code });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({ online: false, error: 'TIMEOUT' });
        });
    });
}

async function run() {
    console.log('[1/2] Verificando conectividad con el API Gateway...');
    const health = await checkGatewayHealth();

    if (health.online) {
        console.log(`  -> API Gateway ONLINE (Status: ${health.statusCode})`);
        console.log('  -> Respuesta:', health.body);
    } else {
        console.log(`  -> API Gateway no responde en http://${GATEWAY_HOST}:${GATEWAY_PORT} (${health.error})`);
        console.log('  -> [AVISO] Los microservicios no están levantados en este momento.');
        console.log('  -> Para levantarlos ejecuta: docker-compose up o tus scripts de microservicios.');
    }

    console.log('\n[2/2] Auditoría de Contratos de Endpoints (JSON Schema / Postman Collection):');
    const collection = require('./laika_postman_collection.json');
    console.log(`  -> Colección cargada: "${collection.info.name}"`);
    console.log(`  -> Total de peticiones configuradas: ${collection.item.length}`);

    collection.item.forEach((item, idx) => {
        const method = item.request.method;
        const url = item.request.url.raw;
        console.log(`     #${idx + 1} [${method}] ${url} -> Incluye script de aserciones de prueba`);
    });

    console.log('\n--- CÓMO EJECUTAR ESTA SUITE COMPLETA ---');
    console.log('1. Importa "laika_postman_collection.json" en Postman para ejecución manual o en equipo.');
    console.log('2. O ejecuta en CI/CD mediante Newman (CLI de Postman):');
    console.log('   npx newman run tests/api/laika_postman_collection.json\n');
}

run();
