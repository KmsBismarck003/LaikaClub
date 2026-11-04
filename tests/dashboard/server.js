/**
 * SERVIDOR DEL DASHBOARD VISUAL DE PRUEBAS - LAIKA CLUB
 * Servidor HTTP nativo sin dependencias externas (Zero npm install).
 * - Autodetecta dinámicamente suites y escenarios individuales en tests/
 * - Monitorea en vivo el estado de Pilgrim API Gateway (puerto 8000)
 * - Ejecuta pruebas bajo demanda con streaming de salida en tiempo real (SSE)
 *
 * Ejecución: node tests/dashboard/server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { URL } = require('url');

const PORT = process.env.TEST_DASHBOARD_PORT || 5050;
const WORKSPACE_ROOT = path.resolve(__dirname, '..', '..');
const TESTS_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.resolve(__dirname, 'public');
const GATEWAY_URL = process.env.LAIKA_GATEWAY_URL || 'http://localhost:8000';

// Importa los metadatos de los 20 escenarios reales
let LIVE_SCENARIOS_META = [];
try {
    const liveTestsModule = require(path.join(TESTS_ROOT, 'integration', 'real_system_live_tests.js'));
    LIVE_SCENARIOS_META = liveTestsModule.LIVE_SCENARIOS_META || [];
} catch (_) {}

// Diccionario de metadatos para las suites completas
const METADATA_DICTIONARY = {
    'real_system_live_tests.js': {
        name: '★ Ejecutar los 36 Escenarios en Vivo (Suite Completa) ★',
        category: 'Integración en Vivo',
        description: 'Corre en secuencia los 36 escenarios reales contra Docker: Auth, Doble clic, Transferencias, Cortesías, Cancelaciones, Mercancía y Concurrencia.',
        requiresLive: true,
        priority: 1
    },
    'pilgrim_and_ports_audit.js': {
        name: 'Auditoría de 12 Puertos, Verbos HTTP y Pilgrim',
        category: 'Infraestructura & Gateway',
        description: 'Escanea los 12 puertos TCP del ecosistema y valida los métodos GET, POST, PUT, DELETE, OPTIONS en Pilgrim.',
        requiresLive: true,
        priority: 2
    },
    'run-unit-tests.js': {
        name: '35 Pruebas Unitarias de Lógica y Negocio',
        category: 'Pruebas Unitarias',
        description: 'Verifica en frío algoritmos de validación de correo, contraseñas, sanitización y estados de boletos.',
        requiresLive: false,
        priority: 3
    },
    'run-ml-unit-tests.js': {
        name: '25 Pruebas Unitarias de Algoritmos ML & Big Data',
        category: 'Pruebas Unitarias ML',
        description: 'Valida en frío cálculos matemáticos de R², MAE/RMSE, K-Means, Elbow SSE, árboles de decisión y reconciliación MATIS.',
        requiresLive: false,
        priority: 4
    },
    'ml_and_bigdata_live_tests.js': {
        name: '15 Pruebas en Vivo: ML, Big Data & MATIS BI',
        category: 'Machine Learning & BI',
        description: 'Audita endpoints en vivo de regresión, árboles de decisión, clustering B2B, bots con Isolation Forest y MATIS.',
        requiresLive: true,
        priority: 5
    },
    'simulate_ml_analytics_load.js': {
        name: 'Simulador de Carga y Concurrencia ML/Big Data',
        category: 'Rendimiento ML',
        description: 'Lanza 20 peticiones paralelas contra los modelos de regresión, clustering y gráficos 3D para auditar tiempos de respuesta.',
        requiresLive: false,
        priority: 6
    },
    'simulate_concurrency_stress.js': {
        name: 'Simulador de Concurrencia y Doble Compra',
        category: 'Rendimiento & Carga',
        description: 'Simula 30 compradores simultáneos disputando el mismo asiento para auditar race conditions.',
        requiresLive: false,
        priority: 4
    },
    'api-runner.js': {
        name: 'Auditoría de Contratos y Colección Postman',
        category: 'Contratos de API',
        description: 'Valida los esquemas de petición y respuesta de la colección oficial Postman de LAIKA Club.',
        requiresLive: false,
        priority: 5
    },
    'auth_and_tickets.spec.js': {
        name: 'Especificación E2E en Navegador Real',
        category: 'End-to-End (E2E)',
        description: 'Flujos visuales interactivos para pruebas de login, caracteres inválidos y torniquete de operador.',
        requiresLive: false,
        priority: 6
    }
};

/**
 * Escanea recursivamente tests/ para autodetectar suites y desglosar los 20 escenarios individuales
 */
function findTestFiles(dir = TESTS_ROOT, fileList = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        // Ignora dashboard, node_modules y carpetas ocultas
        if (entry.isDirectory()) {
            if (entry.name === 'dashboard' || entry.name === 'node_modules' || entry.name.startsWith('.')) {
                continue;
            }
            findTestFiles(fullPath, fileList);
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            // Detecta archivos .js ejecutables
            if (ext === '.js' && !entry.name.includes('Validation') && !entry.name.includes('BusinessLogic')) {
                const relativeToWorkspace = path.relative(WORKSPACE_ROOT, fullPath).replace(/\\/g, '/');
                const relativeToTests = path.relative(TESTS_ROOT, fullPath).replace(/\\/g, '/');
                const subfolder = relativeToTests.split('/')[0] || 'general';

                const meta = METADATA_DICTIONARY[entry.name] || {
                    name: entry.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
                    category: inferCategory(subfolder, entry.name),
                    description: `Prueba autodetectada en la carpeta tests/${subfolder}`,
                    requiresLive: subfolder === 'integration',
                    priority: 99
                };

                const stats = fs.statSync(fullPath);

                fileList.push({
                    id: entry.name.replace(/\.[^/.]+$/, ''),
                    filename: entry.name,
                    subfolder,
                    relativePath: relativeToWorkspace,
                    testId: null,
                    name: meta.name,
                    category: meta.category,
                    description: meta.description,
                    requiresLive: meta.requiresLive,
                    priority: meta.priority,
                    lastModified: stats.mtime
                });
            }
        }
    }
    return fileList;
}

/**
 * Autodetecta suites y desglosa los 20 escenarios individuales para ejecución granular
 */
function scanTestFiles() {
    const fileList = findTestFiles();

    // Desglosar los 20 escenarios reales individuales para ejecución granular con 1 clic
    if (LIVE_SCENARIOS_META.length > 0) {
        LIVE_SCENARIOS_META.forEach(sc => {
            fileList.push({
                id: `live-scenario-${sc.id}`,
                filename: 'real_system_live_tests.js',
                subfolder: 'integration',
                relativePath: 'tests/integration/real_system_live_tests.js',
                testId: sc.id,
                name: `[Prueba ${sc.id < 10 ? '0' + sc.id : sc.id}] ${sc.name}`,
                category: sc.category,
                description: sc.description,
                requiresLive: true,
                priority: 10 + sc.id,
                lastModified: new Date()
            });
        });
    }

    return fileList.sort((a, b) => a.priority - b.priority);
}

function inferCategory(folder, filename) {
    if (folder === 'integration') return 'Integración en Vivo';
    if (folder === 'unit') return 'Pruebas Unitarias';
    if (folder === 'performance') return 'Rendimiento & Carga';
    if (folder === 'api') return 'Contratos de API';
    if (folder === 'e2e') return 'End-to-End (E2E)';
    return 'Pruebas Generales';
}

/**
 * Pings al Gateway para chequear estado de salud
 */
async function checkGatewayHealth() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);
        const res = await fetch(`${GATEWAY_URL}/api/health`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
            const data = await res.json();
            return { online: true, status: data.status, service: data.service, url: GATEWAY_URL };
        }
        return { online: false, status: res.status, url: GATEWAY_URL };
    } catch (err) {
        return { online: false, error: err.message, url: GATEWAY_URL };
    }
}

/**
 * Servidor HTTP
 */
const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // API: Autodetección de pruebas
    if (pathname === '/api/tests') {
        const tests = scanTestFiles();
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ success: true, count: tests.length, tests }));
    }

    // API: Monitoreo de salud del Gateway
    if (pathname === '/api/gateway-status') {
        const health = await checkGatewayHealth();
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify(health));
    }

    // API: Ejecución de prueba con Streaming en Tiempo Real (SSE)
    if (pathname === '/api/run') {
        const targetPath = parsedUrl.searchParams.get('file');
        const testId = parsedUrl.searchParams.get('testId');

        if (!targetPath) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Parámetro file requerido' }));
        }

        const absolutePath = path.resolve(WORKSPACE_ROOT, targetPath);
        if (!fs.existsSync(absolutePath)) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Archivo de prueba no encontrado' }));
        }

        // Configurar Server-Sent Events (SSE)
        res.writeHead(200, {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });

        const sendEvent = (event, data) => {
            res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        };

        sendEvent('start', { file: targetPath, testId, timestamp: new Date().toISOString() });

        const startTime = Date.now();
        const args = [absolutePath];
        if (testId) {
            args.push(`--test=${testId}`);
        }

        const proc = spawn('node', args, {
            cwd: WORKSPACE_ROOT,
            env: process.env
        });

        proc.stdout.on('data', (chunk) => {
            const text = chunk.toString();
            sendEvent('stdout', { text });
        });

        proc.stderr.on('data', (chunk) => {
            const text = chunk.toString();
            sendEvent('stderr', { text });
        });

        proc.on('close', (code) => {
            const durationMs = Date.now() - startTime;
            sendEvent('finish', { code, durationMs, success: code === 0 });
            res.end();
        });

        req.on('close', () => {
            if (!proc.killed) proc.kill();
        });

        return;
    }

    // Servir archivos estáticos del frontend
    let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
    
    // Evitar directory traversal
    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403);
        return res.end('Acceso denegado');
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.ico': 'image/x-icon'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    try {
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    } catch (e) {
        res.writeHead(500);
        res.end('Error al leer archivo estático');
    }
});

server.listen(PORT, () => {
    console.log('\n===============================================================');
    console.log('   DASHBOARD VISUAL DE PRUEBAS - LAIKA CLUB QA SYSTEM');
    console.log(`   Panel interactivo disponible en: http://localhost:${PORT}`);
    console.log('   Autodetección de pruebas activada (Zero Mocks)');
    console.log('===============================================================\n');
});
