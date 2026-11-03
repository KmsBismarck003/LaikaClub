/**
 * AUDITORÍA DE PUERTOS, MÉTODOS HTTP (GET, POST, PUT, DELETE, OPTIONS)
 * Y VERIFICACIÓN INTEGRAL DE PILGRIM API GATEWAY (PUERTO 8000)
 *
 * Ejecución: node tests/integration/pilgrim_and_ports_audit.js
 */

const net = require('net');

const GATEWAY_URL = process.env.LAIKA_GATEWAY_URL || 'http://localhost:8000';

// Catálogo de puertos esperados del ecosistema LAIKA Club
const SYSTEM_PORTS = [
    { port: 8000, name: 'Pilgrim API Gateway (FastAPI / Proxy Inverso)' },
    { port: 8101, name: 'Auth Service (Java / Spring Boot Core)' },
    { port: 8102, name: 'Admin Service (Java / Spring Boot Core)' },
    { port: 8103, name: 'Stats Service (Java / Spring Boot Core)' },
    { port: 8201, name: 'Events Service (Java / Spring Boot Operaciones)' },
    { port: 8202, name: 'Tickets Service (Java / Spring Boot Operaciones)' },
    { port: 8203, name: 'Merchandise Service (Java / Spring Boot Operaciones)' },
    { port: 8301, name: 'Achievements Service (Java / Spring Boot Intel)' },
    { port: 8302, name: 'Analytics Service (Java / Spring Boot Intel)' },
    { port: 8303, name: 'Analytics BigData Service (Python / Spark)' },
    { port: 3000, name: 'Frontend React (Web Application)' },
    { port: 3306, name: 'MySQL Database (Docker: laika_db)' }
];

let passCount = 0;
let failCount = 0;
const results = [];

function recordTest(id, name, success, details = '') {
    if (success) {
        passCount++;
        results.push({ id, status: 'PASSED', name });
        console.log(`  [PASS] #${id} - ${name}`);
    } else {
        failCount++;
        results.push({ id, status: 'FAILED', name, details });
        console.error(`  [FAIL] #${id} - ${name} -> ERROR: ${details}`);
    }
}

function checkPortOpen(port, timeoutMs = 1500) {
    return new Promise((resolve) => {
        const socket = net.createConnection({ host: 'localhost', port, timeout: timeoutMs });
        socket.on('connect', () => {
            socket.destroy();
            resolve({ port, open: true });
        });
        socket.on('error', (err) => {
            resolve({ port, open: false, error: err.code });
        });
        socket.on('timeout', () => {
            socket.destroy();
            resolve({ port, open: false, error: 'TIMEOUT' });
        });
    });
}

async function runPilgrimAndPortsAudit() {
    console.log('\n===============================================================');
    console.log('   AUDITORÍA DE PUERTOS, MÉTODOS HTTP Y PILGRIM GATEWAY');
    console.log(`   Gateway Objetivo: ${GATEWAY_URL}`);
    console.log('===============================================================\n');

    // -------------------------------------------------------------
    // FASE 1: AUDITORÍA DE CONECTIVIDAD DE PUERTOS TCP
    // -------------------------------------------------------------
    console.log('--- FASE 1: ESCANEO DE PUERTOS TCP DEL ECOSISTEMA ---');
    const portChecks = await Promise.all(SYSTEM_PORTS.map(p => checkPortOpen(p.port)));

    portChecks.forEach((res, index) => {
        const meta = SYSTEM_PORTS[index];
        const label = `Puerto ${meta.port} [${meta.name}]`;
        recordTest(index + 1, `${label} -> Conexión TCP abierta`, res.open, res.error || 'OK');
    });

    console.log(`\n  Resumen Puertos: ${portChecks.filter(p => p.open).length}/${SYSTEM_PORTS.length} activos.`);

    // -------------------------------------------------------------
    // FASE 2: VERIFICACIÓN DEL SERVICIO PILGRIM GATEWAY
    // -------------------------------------------------------------
    console.log('\n--- FASE 2: ESTADO Y SALUD DE PILGRIM API GATEWAY ---');
    let testIndex = SYSTEM_PORTS.length + 1;

    // 13. Chequeo de Salud (/api/health)
    try {
        const res = await fetch(`${GATEWAY_URL}/api/health`);
        const data = await res.json();
        recordTest(testIndex++, 'Pilgrim Health (/api/health): Responde 200 con status: "healthy"',
            res.status === 200 && data.status === 'healthy' && data.service === 'pilgrim',
            `Status: ${res.status}`);
    } catch (e) {
        recordTest(testIndex++, 'Pilgrim Health', false, e.message);
    }

    // 14. Estado Raíz y Catálogo de Servicios (GET /)
    try {
        const res = await fetch(`${GATEWAY_URL}/`);
        const data = await res.json();
        const validRoot = res.status === 200 && data.gateway?.includes('Pilgrim') && !!data.roles && !!data.target_services;
        recordTest(testIndex++, 'Pilgrim Root (GET /): Expone versión 2.0.0, roles y servicios enrutados',
            validRoot,
            `Status: ${res.status}, Gateway: ${data.gateway}`);
    } catch (e) {
        recordTest(testIndex++, 'Pilgrim Root', false, e.message);
    }

    // 15. Enrutamiento de Proxy Inverso a Auth (/api/auth/health -> auth:8101)
    try {
        const res = await fetch(`${GATEWAY_URL}/api/auth/health`);
        const data = await res.json();
        recordTest(testIndex++, 'Pilgrim Proxy Inverso -> Auth Service (/api/auth/health): Reenvío transparente 200 OK',
            res.status === 200 && data.service === 'auth-service',
            `Status: ${res.status}, Service: ${data.service}`);
    } catch (e) {
        recordTest(testIndex++, 'Proxy Auth', false, e.message);
    }

    // 16. Enrutamiento de Proxy Inverso a Tickets (/api/tickets/health -> tickets:8202)
    try {
        const res = await fetch(`${GATEWAY_URL}/api/tickets/health`);
        const data = await res.json();
        recordTest(testIndex++, 'Pilgrim Proxy Inverso -> Ticket Service (/api/tickets/health): Reenvío transparente 200 OK',
            res.status === 200 && data.service?.includes('ticket-service'),
            `Status: ${res.status}, Service: ${data.service}`);
    } catch (e) {
        recordTest(testIndex++, 'Proxy Tickets', false, e.message);
    }

    // -------------------------------------------------------------
    // FASE 3: AUDITORÍA DE MÉTODOS HTTP (GET, POST, PUT, DELETE, OPTIONS)
    // -------------------------------------------------------------
    console.log('\n--- FASE 3: MÉTODOS HTTP (VERBOS REST EN PILGRIM) ---');

    let adminToken = null;

    // Login previo para obtener token
    try {
        const res = await fetch(`${GATEWAY_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@laikaclub.com', password: 'gearsof2' })
        });
        const d = await res.json();
        adminToken = d.token;
    } catch (_) {}

    // 17. Método GET
    try {
        const res = await fetch(`${GATEWAY_URL}/api/health`, { method: 'GET' });
        recordTest(testIndex++, 'Método [GET]: Procesado y respondido exitosamente por Pilgrim (200 OK)',
            res.status === 200,
            `Status: ${res.status}`);
    } catch (e) {
        recordTest(testIndex++, 'Método GET', false, e.message);
    }

    // 18. Método POST
    try {
        const res = await fetch(`${GATEWAY_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@laikaclub.com', password: 'gearsof2' })
        });
        recordTest(testIndex++, 'Método [POST]: Enrutado con payload JSON y emisión de respuesta (200 OK)',
            res.status === 200,
            `Status: ${res.status}`);
    } catch (e) {
        recordTest(testIndex++, 'Método POST', false, e.message);
    }

    // 19. Método PUT
    try {
        const res = await fetch(`${GATEWAY_URL}/api/auth/users/1/permissions`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({ role: 'admin', permissions: { all: true } })
        });
        const data = await res.json();
        recordTest(testIndex++, 'Método [PUT]: Actualización enrutada y procesada por el microservicio (200 OK)',
            res.status === 200 && data.status === 'success',
            `Status: ${res.status}`);
    } catch (e) {
        recordTest(testIndex++, 'Método PUT', false, e.message);
    }

    // 20. Método DELETE
    try {
        const res = await fetch(`${GATEWAY_URL}/api/tickets/lock`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({ eventId: 19, seatId: 'AUDIT-TEST-SEAT' })
        });
        const data = await res.json();
        recordTest(testIndex++, 'Método [DELETE]: Petición de eliminación/liberación enrutada (200 OK)',
            res.status === 200 && data.status === 'success',
            `Status: ${res.status}`);
    } catch (e) {
        recordTest(testIndex++, 'Método DELETE', false, e.message);
    }

    // 21. Método OPTIONS (CORS Preflight)
    try {
        const res = await fetch(`${GATEWAY_URL}/api/auth/login`, {
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type, Authorization'
            }
        });
        const originHeader = res.headers.get('access-control-allow-origin');
        const methodsHeader = res.headers.get('access-control-allow-methods');
        const corsValid = res.status === 200 && !!originHeader && methodsHeader?.includes('POST');
        recordTest(testIndex++, 'Método [OPTIONS / CORS Preflight]: Pilgrim valida origen y expone métodos permitidos',
            corsValid,
            `Status: ${res.status}, Allow-Origin: ${originHeader}`);
    } catch (e) {
        recordTest(testIndex++, 'Método OPTIONS CORS', false, e.message);
    }

    // 22. Manejo de Rutas Inexistentes (404 Not Found)
    try {
        const res = await fetch(`${GATEWAY_URL}/api/ruta_inexistente_de_prueba`);
        recordTest(testIndex++, 'Manejo de Rutas Inexistentes: Pilgrim responde con 404 Not Found controlado',
            res.status === 404,
            `Status: ${res.status}`);
    } catch (e) {
        recordTest(testIndex++, 'Ruta inexistente 404', false, e.message);
    }

    // -------------------------------------------------------------
    // RESUMEN FINAL
    // -------------------------------------------------------------
    console.log('\n===============================================================');
    console.log('   RESUMEN FINAL DE AUDITORÍA DE PUERTOS Y PILGRIM GATEWAY');
    console.log('===============================================================');
    console.log(`TOTAL DE COMPROBACIONES:    ${results.length}`);
    console.log(`EXITOSAS (PASSED):          ${passCount}`);
    console.log(`FALLIDAS (FAILED):          ${failCount}`);
    console.log(`ESTADO GENERAL DE PILGRIM:  ${failCount === 0 ? 'TOTALMENTE OPERATIVO (100% OK)' : 'DEGRADADO'}`);
    console.log('===============================================================\n');

    if (failCount > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runPilgrimAndPortsAudit();
