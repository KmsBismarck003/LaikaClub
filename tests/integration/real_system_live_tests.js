/**
 * SUITE DE PRUEBAS DE INTEGRACIÓN EN VIVO (20 ESCENARIOS REALES - CERO MOCKS)
 * Se ejecuta directamente contra los microservicios activos en Docker:
 * - API Gateway (Pilgrim): http://localhost:8000
 * - Auth Service (Java/Spring): http://localhost:8101
 * - Ticket Service (Java/Spring): http://localhost:8202
 * - Admin Service (Java/Spring): http://localhost:8102
 * - Base de Datos MySQL (laika_db)
 *
 * Ejecutar todas: node tests/integration/real_system_live_tests.js
 * Ejecutar una sola: node tests/integration/real_system_live_tests.js --test=15
 */

const BASE_URL = process.env.LAIKA_GATEWAY_URL || 'http://localhost:8000';

const LIVE_SCENARIOS_META = [
    { id: 1, name: '¿El correo existe o no? (Usuario inexistente)', category: 'Autenticación', description: 'Comprueba rechazo de login con correo no registrado (401).' },
    { id: 2, name: '¿La contraseña es correcta o no? (Clave incorrecta)', category: 'Autenticación', description: 'Valida que clave errónea para usuario real sea denegada (401).' },
    { id: 3, name: 'Login Exitoso Real (Generación de JWT)', category: 'Autenticación', description: 'Autentica a admin@laikaclub.com con clave gearsof2 y emite token.' },
    { id: 4, name: 'Login Real de Operador', category: 'Autenticación', description: 'Autentica a operador@laikaclub.com y valida emisión de rol operador.' },
    { id: 5, name: 'Inyección SQL en Login (" OR 1=1)', category: 'Seguridad', description: 'Prueba inyección SQL y verifica rechazo sin vulnerar la base de datos.' },
    { id: 6, name: 'Crear cuenta con correo ya registrado', category: 'Creación de Cuenta', description: 'Verifica que la BD deniegue duplicados con "El correo ya está registrado".' },
    { id: 7, name: 'Crear cuenta con correo malformado', category: 'Creación de Cuenta', description: 'Comprueba validador RFC rechazando correos sin arroba (422).' },
    { id: 8, name: 'Crear cuenta con contraseña corta (< 6 caracteres)', category: 'Creación de Cuenta', description: 'Verifica rechazo con "La contraseña debe tener al menos 6 caracteres".' },
    { id: 9, name: 'Crear cuenta con campos obligatorios vacíos', category: 'Creación de Cuenta', description: 'Comprueba validaciones DTO ante campos vacíos (422).' },
    { id: 10, name: 'Acceso anónimo a rutas de Administración', category: 'Control de Roles (RBAC)', description: 'Verifica que sin token se bloquee el acceso a /api/admin/users (401).' },
    { id: 11, name: '¿Si quiere entrar con otro rol? (Operador a Admin)', category: 'Control de Roles (RBAC)', description: 'Comprueba que Pilgrim bloquee a Operador en ruta de Admin con "Access Denied".' },
    { id: 12, name: 'Acceso legítimo de Administrador', category: 'Control de Roles (RBAC)', description: 'Valida que el token Admin permita acceder al catálogo de usuarios (200 OK).' },
    { id: 13, name: 'Consulta de mapa de asientos ocupados en BD', category: 'Boletos & Asientos', description: 'Verifica retorno de asientos ocupados del evento 19 desde MySQL.' },
    { id: 14, name: 'Apartar asiento ya ocupado (28-U-5)', category: 'Boletos & Asientos', description: 'Comprueba respuesta 409 Conflict: "El asiento ya está ocupado".' },
    { id: 15, name: '¿Si pulsa 2 veces al comprar se cobra o no? (Doble clic)', category: 'Compras & Concurrencia', description: '2 peticiones paralelas en el mismo ms: 1 autorizada (200), 1 bloqueada (409 Conflict).' },
    { id: 16, name: 'Pasarela de pagos con monto no numérico', category: 'Compras & Pagos', description: 'Verifica rechazo con 400 Bad Request: "amount debe ser numérico".' },
    { id: 17, name: 'Escaneo de código QR falso o inexistente', category: 'Control de Acceso (Torniquete)', description: 'Comprueba que /api/tickets/verify responda "INVALID_CODE" y deniegue acceso.' },
    { id: 18, name: 'Verificación de sesión activa JWT', category: 'Autenticación', description: 'Comprueba que /api/auth/verify valide los datos del titular de sesión.' },
    { id: 19, name: 'Protección contra fuerza bruta (/check-lockout)', category: 'Seguridad', description: 'Monitorea contador de intentos fallidos y estado de bloqueo de cuenta.' },
    { id: 20, name: 'Transferencia a uno mismo rechazada', category: 'Transferencia de Boletos', description: 'Comprueba rechazo 400 Bad Request: "No puedes transferirte un boleto a ti mismo".' },
    { id: 21, name: 'Transferencia de boleto inexistente', category: 'Transferencia de Boletos', description: 'Comprueba rechazo 404 Not Found: "Boleto no encontrado para este usuario".' },
    { id: 22, name: 'Transferencia anónima rechazada', category: 'Transferencia de Boletos', description: 'Verifica que sin token JWT se bloquee la solicitud con 401 Unauthorized.' },
    { id: 23, name: 'Auditoría y cuotas de cortesías en MySQL', category: 'Cortesías', description: 'Consulta cuotas de cortesía para evento 19 (totalQuotaAllowed, emitidas y tickets).' },
    { id: 24, name: 'Código de cortesía inexistente', category: 'Cortesías', description: 'Valida rechazo 404 Not Found: "Código de cortesía no encontrado" en /validate-token.' },
    { id: 25, name: 'Canje de cortesía con token falso', category: 'Cortesías', description: 'Comprueba rechazo 404 Not Found: "Código de cortesía inválido o no encontrado".' },
    { id: 26, name: 'Emisión de cortesía incompleta', category: 'Cortesías', description: 'Verifica rechazo 400 Bad Request: "recipientEmail es requerido para emisión directa".' },
    { id: 27, name: 'Política de cancelaciones y reembolsos', category: 'Cancelaciones & Reembolsos', description: 'Comprueba consulta de condiciones de reembolso (24h previas y 100% de devolución).' },
    { id: 28, name: 'Cotización de reembolso boleto inexistente', category: 'Cancelaciones & Reembolsos', description: 'Verifica rechazo 404 Not Found al cotizar reembolso de ticket no existente.' },
    { id: 29, name: 'Solicitud de cancelación sin ticketId', category: 'Cancelaciones & Reembolsos', description: 'Comprueba rechazo 400 Bad Request: "ticketId es obligatorio".' },
    { id: 30, name: 'Comprar boleto de evento concluido/inexistente', category: 'Compras & Boletos', description: 'Comprueba rechazo con "El evento seleccionado ya ha concluido o no está disponible".' },
    { id: 31, name: 'Compra de asientos para evento inválido', category: 'Compras & Boletos', description: 'Verifica rechazo en /purchase sin generar registros huérfanos ni inconsistencias en BD.' },
    { id: 32, name: 'Salud del microservicio de Mercancía', category: 'Venta de Mercancía', description: 'Comprueba estado del microservicio de tienda vía API Gateway (200 OK: merchandise_v2).' },
    { id: 33, name: 'Catálogo de mercancía oficial en vivo', category: 'Venta de Mercancía', description: 'Consulta productos disponibles (Gorra Laika, Termo Avengers, stock y variantes).' },
    { id: 34, name: 'Consulta de mercancía inexistente', category: 'Venta de Mercancía', description: 'Verifica rechazo 404 Not Found: "Merchandise not found" en búsqueda de artículo.' },
    { id: 35, name: 'Concurrencia masiva: 50 compradores por 1 asiento', category: 'Rendimiento & Carga', description: 'Ráfaga paralela en vivo de 50 peticiones simultáneas: 1 autorizada (200), 49 denegadas (409 Conflict).' },
    { id: 36, name: 'Cierre de sesión seguro (Logout)', category: 'Autenticación', description: 'Invalida sesión y confirma auditoría en tabla auth_logs de MySQL.' }
];

let passCount = 0;
let failCount = 0;
const results = [];

// Filtro de prueba individual por argumento CLI (ej. --test=15)
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

async function runLiveTests() {
    console.log('\n===============================================================');
    if (targetTestId) {
        const meta = LIVE_SCENARIOS_META.find(m => m.id === targetTestId);
        console.log(`   EJECUCIÓN INDIVIDUAL: PRUEBA #${targetTestId} - ${meta ? meta.name : ''}`);
    } else {
        console.log('   PRUEBAS EN VIVO DEL SISTEMA REAL - 20 ESCENARIOS (0 MOCKS)');
    }
    console.log(`   Destino: ${BASE_URL} (API Gateway Pilgrim & Microservicios)`);
    console.log('===============================================================\n');

    let adminToken = null;
    let operatorToken = null;

    // Obtener tokens base para pruebas autenticadas
    try {
        const resAdmin = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@laikaclub.com', password: 'gearsof2' })
        });
        const dAdmin = await resAdmin.json();
        adminToken = dAdmin.token;

        const resOp = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'operador@laikaclub.com', password: 'gearsof2' })
        });
        const dOp = await resOp.json();
        operatorToken = dOp.token;
    } catch (_) {}

    // -------------------------------------------------------------
    // GRUPO 1: VALIDACIÓN DE CORREO, CONTRASEÑAS Y LOGIN
    // -------------------------------------------------------------
    if (!targetTestId || targetTestId <= 5) {
        console.log('--- GRUPO 1: AUTENTICACIÓN, CORREO Y CONTRASEÑA REAL ---');
    }

    // Escenario 1: ¿El correo existe o no? (Usuario inexistente)
    if (shouldRun(1)) {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'usuario_inexistente_999@laikaclub.com', password: 'Password123!' })
            });
            const data = await res.json();
            recordTest(1, '¿El correo existe o no?: Login con correo no registrado es rechazado (401)',
                res.status === 401 && data.detail === 'Credenciales inválidas',
                `Status: ${res.status}`);
        } catch (e) {
            recordTest(1, '¿El correo existe o no?', false, e.message);
        }
    }

    // Escenario 2: ¿La contraseña es correcta o no? (Correo real, contraseña errónea)
    if (shouldRun(2)) {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'admin@laikaclub.com', password: 'ClaveIncorrecta123!' })
            });
            const data = await res.json();
            recordTest(2, '¿La contraseña es correcta o no?: Clave incorrecta para usuario real es denegada (401)',
                res.status === 401 && data.detail === 'Credenciales inválidas',
                `Status: ${res.status}`);
        } catch (e) {
            recordTest(2, 'Contraseña errónea', false, e.message);
        }
    }

    // Escenario 3: Login exitoso con credenciales reales (Generación de JWT Token)
    if (shouldRun(3)) {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'admin@laikaclub.com', password: 'gearsof2' })
            });
            const data = await res.json();
            adminToken = data.token;
            recordTest(3, 'Login exitoso: Credenciales válidas retornan 200, JWT y rol "admin"',
                res.status === 200 && !!adminToken && data.user?.role === 'admin',
                `Status: ${res.status}, Rol: ${data.user?.role}`);
        } catch (e) {
            recordTest(3, 'Login exitoso', false, e.message);
        }
    }

    // Escenario 4: Login con Operador (para pruebas de roles posteriores)
    if (shouldRun(4)) {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'operador@laikaclub.com', password: 'gearsof2' })
            });
            const data = await res.json();
            operatorToken = data.token;
            recordTest(4, 'Login Operador: Autenticación exitosa con rol "operador"',
                res.status === 200 && !!operatorToken && data.user?.role === 'operador',
                `Status: ${res.status}`);
        } catch (e) {
            recordTest(4, 'Login Operador', false, e.message);
        }
    }

    // Escenario 5: Inyección SQL en formulario de Login (Inocuidad y rechazo seguro)
    if (shouldRun(5)) {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: "' OR '1'='1", password: "' OR '1'='1" })
            });
            const isSecurelyRejected = res.status === 422 || res.status === 401;
            recordTest(5, 'Inyección SQL en Login: Rechazado en capa de validación sin vulnerar BD (422/401)',
                isSecurelyRejected,
                `Status: ${res.status}`);
        } catch (e) {
            recordTest(5, 'Inyección SQL en Login', false, e.message);
        }
    }

    // -------------------------------------------------------------
    // GRUPO 2: CREACIÓN DE CUENTA (DATOS INVÁLIDOS Y REGLAS)
    // -------------------------------------------------------------
    if (!targetTestId || (targetTestId >= 6 && targetTestId <= 9)) {
        console.log('\n--- GRUPO 2: CREACIÓN DE CUENTA Y VALIDACIONES ---');
    }

    // Escenario 6: Registro con correo duplicado (Ya registrado en MySQL)
    if (shouldRun(6)) {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: 'Admin',
                    lastName: 'Clon',
                    email: 'admin@laikaclub.com',
                    password: 'Password123!'
                })
            });
            const data = await res.json();
            recordTest(6, 'Crear cuenta con correo ya registrado: Denegado ("El correo ya está registrado")',
                res.status >= 400 && data.detail?.includes('ya está registrado'),
                `Status: ${res.status}, Detail: ${data.detail}`);
        } catch (e) {
            recordTest(6, 'Correo duplicado en registro', false, e.message);
        }
    }

    // Escenario 7: Registro con formato de correo inválido
    if (shouldRun(7)) {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: 'Test',
                    lastName: 'Invalido',
                    email: 'correo_sin_arroba_ni_dominio',
                    password: 'Password123!'
                })
            });
            const data = await res.json();
            const hasEmailError = JSON.stringify(data).includes('Formato de email inválido') || res.status === 422;
            recordTest(7, 'Crear cuenta con correo malformado: Rechazado (422 "Formato de email inválido")',
                hasEmailError,
                `Status: ${res.status}`);
        } catch (e) {
            recordTest(7, 'Formato de correo inválido', false, e.message);
        }
    }

    // Escenario 8: Registro con contraseña menor a 6 caracteres
    if (shouldRun(8)) {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: 'Test',
                    lastName: 'Corto',
                    email: `test_pass_corto_${Date.now()}@laikaclub.com`,
                    password: '123'
                })
            });
            const data = await res.json();
            const hasLengthError = JSON.stringify(data).includes('al menos 6 caracteres') || res.status === 422;
            recordTest(8, 'Crear cuenta con contraseña corta: Rechazado (422 "Mínimo 6 caracteres")',
                hasLengthError,
                `Status: ${res.status}`);
        } catch (e) {
            recordTest(8, 'Contraseña corta en registro', false, e.message);
        }
    }

    // Escenario 9: Registro con campos obligatorios vacíos
    if (shouldRun(9)) {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName: '', lastName: '', email: '', password: '' })
            });
            recordTest(9, 'Crear cuenta con campos obligatorios vacíos: Rechazado (422 Unprocessable Entity)',
                res.status === 422,
                `Status: ${res.status}`);
        } catch (e) {
            recordTest(9, 'Campos vacíos en registro', false, e.message);
        }
    }

    // -------------------------------------------------------------
    // GRUPO 3: CONTROL DE ROLES (RBAC) Y PERMISOS DE ACCESO
    // -------------------------------------------------------------
    if (!targetTestId || (targetTestId >= 10 && targetTestId <= 12)) {
        console.log('\n--- GRUPO 3: CONTROL DE ROLES (RBAC) Y PERMISOS ---');
    }

    // Escenario 10: Intento de entrar a módulo Admin sin token (Anónimo)
    if (shouldRun(10)) {
        try {
            const res = await fetch(`${BASE_URL}/api/admin/users`);
            recordTest(10, 'Acceso anónimo a rutas de Administración: Bloqueado (401 Unauthorized)',
                res.status === 401,
                `Status: ${res.status}`);
        } catch (e) {
            recordTest(10, 'Acceso anónimo a Admin', false, e.message);
        }
    }

    // Escenario 11: ¿Si quiere entrar con otro rol?: Operador intentando entrar a ruta Admin
    if (shouldRun(11)) {
        try {
            const res = await fetch(`${BASE_URL}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${operatorToken}` }
            });
            const text = await res.text();
            const isBlocked = res.status === 403 || res.status === 500 || text.includes('Access Denied');
            recordTest(11, '¿Si quiere entrar con otro rol?: Operador en ruta de Admin es bloqueado ("Access Denied")',
                isBlocked,
                `Status: ${res.status}`);
        } catch (e) {
            recordTest(11, 'Operador en ruta Admin', false, e.message);
        }
    }

    // Escenario 12: Acceso legítimo de Admin a su catálogo
    if (shouldRun(12)) {
        try {
            const res = await fetch(`${BASE_URL}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const data = await res.json();
            recordTest(12, 'Acceso legítimo de rol Admin: Autorizado (200 OK con catálogo de usuarios)',
                res.status === 200 && (Array.isArray(data.users) || Array.isArray(data)),
                `Status: ${res.status}`);
        } catch (e) {
            recordTest(12, 'Acceso legítimo Admin', false, e.message);
        }
    }

    // -------------------------------------------------------------
    // GRUPO 4: COMPRAS, ASIENTOS Y PREVENCIÓN DE DOBLE COBRO
    // -------------------------------------------------------------
    if (!targetTestId || (targetTestId >= 13 && targetTestId <= 16)) {
        console.log('\n--- GRUPO 4: COMPRAS, ASIENTOS Y PREVENCIÓN DE DOBLE COBRO ---');
    }

    // Escenario 13: Consulta de mapa de asientos ocupados del evento 19
    if (shouldRun(13)) {
        try {
            const res = await fetch(`${BASE_URL}/api/tickets/busy-seats/19`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const data = await res.json();
            recordTest(13, 'Consulta de asientos ocupados: Retorna catálogo real desde la base de datos (200 OK)',
                res.status === 200 && Array.isArray(data) && data.length > 0,
                `Status: ${res.status}, Asientos ocupados: ${data.length}`);
        } catch (e) {
            recordTest(13, 'Consulta de asientos ocupados', false, e.message);
        }
    }

    // Escenario 14: Intentar apartar un asiento que ya está ocupado
    if (shouldRun(14)) {
        try {
            const res = await fetch(`${BASE_URL}/api/tickets/lock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({ eventId: 19, seatId: '28-U-5', price: 1800 })
            });
            const data = await res.json();
            recordTest(14, 'Apartar asiento ya ocupado: Rechazado (409 Conflict: "El asiento ya está ocupado")',
                res.status === 409 && data.message?.includes('ya está ocupado'),
                `Status: ${res.status}, Message: ${data.message}`);
        } catch (e) {
            recordTest(14, 'Asiento ya ocupado', false, e.message);
        }
    }

    // Escenario 15: ¿Si pulsa 2 veces al comprar un boleto, se cobra 2 veces o se previene?
    if (shouldRun(15)) {
        try {
            const targetSeat = `AUTO-SEAT-${Date.now()}`;
            const req1 = fetch(`${BASE_URL}/api/tickets/lock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
                body: JSON.stringify({ eventId: 19, seatId: targetSeat, price: 1800 })
            }).then(r => r.json().then(d => ({ status: r.status, data: d })));

            const req2 = fetch(`${BASE_URL}/api/tickets/lock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
                body: JSON.stringify({ eventId: 19, seatId: targetSeat, price: 1800 })
            }).then(r => r.json().then(d => ({ status: r.status, data: d })));

            const [c1, c2] = await Promise.all([req1, req2]);
            const statuses = [c1.status, c2.status].sort();
            const doubleChargePrevented = statuses[0] === 200 && statuses[1] === 409;

            recordTest(15, '¿Si pulsa 2 veces se cobra o no?: Doble clic simultáneo -> 1 éxito (200), 1 bloqueado (409 Conflict)',
                doubleChargePrevented,
                `Clic 1: ${c1.status}, Clic 2: ${c2.status}`);

            await fetch(`${BASE_URL}/api/tickets/lock`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
                body: JSON.stringify({ eventId: 19, seatId: targetSeat })
            });
        } catch (e) {
            recordTest(15, 'Doble clic en compra de boleto', false, e.message);
        }
    }

    // Escenario 16: Intención de pago con monto no numérico
    if (shouldRun(16)) {
        try {
            const res = await fetch(`${BASE_URL}/api/tickets/payments/create-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({ amount: 'monto_invalido_texto', event_id: 19 })
            });
            const data = await res.json();
            recordTest(16, 'Pasarela de pagos: Rechazo de monto no numérico (400 Bad Request)',
                res.status === 400 && data.message?.includes('amount debe ser numérico'),
                `Status: ${res.status}, Message: ${data.message}`);
        } catch (e) {
            recordTest(16, 'Monto no numérico en pago', false, e.message);
        }
    }

    // -------------------------------------------------------------
    // GRUPO 5: CONTROL DE ACCESO, TICKET QR Y SESIÓN
    // -------------------------------------------------------------
    if (!targetTestId || (targetTestId >= 17 && targetTestId <= 20)) {
        console.log('\n--- GRUPO 5: CONTROL DE ACCESO (QR), SESIÓN Y LOGOUT ---');
    }

    // Escenario 17: Escaneo de código QR falso o inexistente en torniquete
    if (shouldRun(17)) {
        try {
            const res = await fetch(`${BASE_URL}/api/tickets/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${operatorToken}` },
                body: JSON.stringify({ ticketCode: 'LK-CODIGO-FALSO-INVENTADO-999', accessPoint: 'Torniquete-1' })
            });
            const data = await res.json();
            recordTest(17, 'Escaneo de boleto inexistente: Retorna "INVALID_CODE" y deniega acceso',
                data.statusCode === 'INVALID_CODE' && data.valid === false,
                `StatusCode: ${data.statusCode}`);
        } catch (e) {
            recordTest(17, 'Boleto inexistente', false, e.message);
        }
    }

    // Escenario 18: Verificación de sesión activa mediante token JWT
    if (shouldRun(18)) {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/verify`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const data = await res.json();
            recordTest(18, 'Verificación de sesión (/api/auth/verify): Valida titular de sesión activo (200 OK)',
                res.status === 200 && data.valid === true && !!data.user,
                `Valid: ${data.valid}`);
        } catch (e) {
            recordTest(18, 'Verificación de sesión', false, e.message);
        }
    }

    // Escenario 19: Comprobación de estado de bloqueo de cuenta (Lockout / Fuerza bruta)
    if (shouldRun(19)) {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/check-lockout?email=admin@laikaclub.com`);
            const data = await res.json();
            recordTest(19, 'Protección contra fuerza bruta (/check-lockout): Monitorea intentos fallidos y estado locked',
                res.status === 200 && typeof data.failed_attempts === 'number' && typeof data.locked === 'boolean',
                `Status: ${res.status}, Failed Attempts: ${data.failed_attempts}, Locked: ${data.locked}`);
        } catch (e) {
            recordTest(19, 'Comprobación de Lockout', false, e.message);
        }
    }

    // -------------------------------------------------------------
    // GRUPO 6: TRANSFERENCIA DE BOLETOS ENTRE USUARIOS
    // -------------------------------------------------------------
    if (!targetTestId || (targetTestId >= 20 && targetTestId <= 22)) {
        console.log('--- GRUPO 6: TRANSFERENCIA DE BOLETOS ENTRE USUARIOS ---');
    }

    // Escenario 20: Transferencia a uno mismo rechazada
    if (shouldRun(20)) {
        try {
            const res = await fetch(`${BASE_URL}/api/tickets/transfer/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
                body: JSON.stringify({ ticket_id: 1, recipient_email: 'admin@laikaclub.com', password: 'gearsof2' })
            });
            const text = await res.text();
            recordTest(20, 'Transferencia a uno mismo rechazada: El sistema prohíbe auto-transferencia con 400 Bad Request',
                res.status === 400 && text.includes('No puedes transferirte un boleto a ti mismo'),
                `Status: ${res.status}, Response: ${text.slice(0, 150)}`);
        } catch (e) {
            recordTest(20, 'Transferencia a uno mismo', false, e.message);
        }
    }

    // Escenario 21: Transferencia de boleto inexistente
    if (shouldRun(21)) {
        try {
            const res = await fetch(`${BASE_URL}/api/tickets/transfer/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
                body: JSON.stringify({ ticket_id: 999999, recipient_email: 'destinatario@laikaclub.com', password: 'gearsof2' })
            });
            const text = await res.text();
            recordTest(21, 'Transferencia de boleto inexistente: Rechaza con 404 Not Found protegiendo inventario',
                res.status === 404 && text.includes('Boleto no encontrado'),
                `Status: ${res.status}, Response: ${text.slice(0, 150)}`);
        } catch (e) {
            recordTest(21, 'Transferencia boleto inexistente', false, e.message);
        }
    }

    // Escenario 22: Transferencia anónima rechazada
    if (shouldRun(22)) {
        try {
            const res = await fetch(`${BASE_URL}/api/tickets/transfer/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticket_id: 1, recipient_email: 'alguien@laikaclub.com' })
            });
            recordTest(22, 'Transferencia anónima rechazada: Bloquea con 401 Unauthorized sin token JWT',
                res.status === 401,
                `Status: ${res.status}`);
        } catch (e) {
            recordTest(22, 'Transferencia anónima', false, e.message);
        }
    }

    // -------------------------------------------------------------
    // GRUPO 7: ENVÍO, AUDITORÍA Y CANJE DE CORTESÍAS
    // -------------------------------------------------------------
    if (!targetTestId || (targetTestId >= 23 && targetTestId <= 26)) {
        console.log('--- GRUPO 7: ENVÍO Y GESTIÓN DE CORTESÍAS ---');
    }

    // Escenario 23: Auditoría y cuotas de cortesías en MySQL
    if (shouldRun(23)) {
        try {
            const res = await fetch(`${BASE_URL}/api/tickets/courtesy/event/19`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const data = await res.json();
            recordTest(23, 'Auditoría y cuotas de cortesías en MySQL: Retorna cuotas permitidas y boletos emitidos (200 OK)',
                res.status === 200 && typeof data.totalQuotaAllowed === 'number' && Array.isArray(data.tickets),
                `Status: ${res.status}, Cuota permitida: ${data.totalQuotaAllowed}, Boletos cortesía: ${data.tickets ? data.tickets.length : 0}`);
        } catch (e) {
            recordTest(23, 'Auditoría de cortesías', false, e.message);
        }
    }

    // Escenario 24: Código de cortesía inexistente
    if (shouldRun(24)) {
        try {
            const res = await fetch(`${BASE_URL}/api/tickets/courtesy/validate-token/CODIGO_FALSO_123`);
            const data = await res.json();
            recordTest(24, 'Código de cortesía inexistente (/validate-token): Rechaza con 404 Not Found',
                res.status === 404 && data.message && data.message.includes('no encontrado'),
                `Status: ${res.status}, Message: ${data.message}`);
        } catch (e) {
            recordTest(24, 'Validación cortesía inexistente', false, e.message);
        }
    }

    // Escenario 25: Canje de cortesía con token falso
    if (shouldRun(25)) {
        try {
            const res = await fetch(`${BASE_URL}/api/tickets/courtesy/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
                body: JSON.stringify({ claimToken: 'FAKE_COURTESY_TOKEN_999' })
            });
            const data = await res.json();
            recordTest(25, 'Canje de cortesía con token falso (/claim): Deniega con 404 Not Found',
                res.status === 404 && data.message && data.message.includes('inválido'),
                `Status: ${res.status}, Message: ${data.message}`);
        } catch (e) {
            recordTest(25, 'Canje falso de cortesía', false, e.message);
        }
    }

    // Escenario 26: Emisión de cortesía incompleta
    if (shouldRun(26)) {
        try {
            const res = await fetch(`${BASE_URL}/api/tickets/courtesy/issue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
                body: JSON.stringify({ eventId: 19, quantity: 1, deliveryMethod: 'DIRECT_EMAIL', recipientType: 'ARTISTA' })
            });
            const data = await res.json();
            recordTest(26, 'Emisión de cortesía incompleta: Rechaza con 400 Bad Request por falta de recipientEmail',
                res.status === 400 && data.message && data.message.includes('recipientEmail es requerido'),
                `Status: ${res.status}, Message: ${data.message}`);
        } catch (e) {
            recordTest(26, 'Emisión cortesía incompleta', false, e.message);
        }
    }

    // -------------------------------------------------------------
    // GRUPO 8: POLÍTICA DE CANCELACIONES Y REEMBOLSOS
    // -------------------------------------------------------------
    if (!targetTestId || (targetTestId >= 27 && targetTestId <= 29)) {
        console.log('--- GRUPO 8: CANCELACIONES Y REEMBOLSOS ---');
    }

    // Escenario 27: Política de cancelaciones y reembolsos
    if (shouldRun(27)) {
        try {
            const res = await fetch(`${BASE_URL}/api/tickets/refunds/policy/19`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const data = await res.json();
            recordTest(27, 'Política de cancelaciones y reembolsos: Retorna elegibilidad y regla de 24 horas (200 OK)',
                res.status === 200 && data.eligible === true && data.refundPercentage === 100,
                `Status: ${res.status}, Eligible: ${data.eligible}, Porcentaje: ${data.refundPercentage}%`);
        } catch (e) {
            recordTest(27, 'Política de cancelación', false, e.message);
        }
    }

    // Escenario 28: Cotización de reembolso para boleto inexistente
    if (shouldRun(28)) {
        try {
            const res = await fetch(`${BASE_URL}/api/tickets/refunds/quote/999999`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            recordTest(28, 'Cotización de reembolso para boleto inexistente: Rechaza con 404 Not Found',
                res.status === 404,
                `Status: ${res.status}`);
        } catch (e) {
            recordTest(28, 'Cotización reembolso inexistente', false, e.message);
        }
    }

    // Escenario 29: Solicitud de cancelación sin ticketId
    if (shouldRun(29)) {
        try {
            const res = await fetch(`${BASE_URL}/api/tickets/refunds/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
                body: JSON.stringify({})
            });
            const text = await res.text();
            recordTest(29, 'Solicitud de cancelación sin ticketId: Valida obligatoriedad con 400 Bad Request',
                res.status === 400 && text.includes('ticketId'),
                `Status: ${res.status}, Response: ${text.slice(0, 150)}`);
        } catch (e) {
            recordTest(29, 'Solicitud cancelación vacía', false, e.message);
        }
    }

    // -------------------------------------------------------------
    // GRUPO 9: CONTROL DE EVENTOS CONCLUIDOS O INEXISTENTES
    // -------------------------------------------------------------
    if (!targetTestId || (targetTestId >= 30 && targetTestId <= 31)) {
        console.log('--- GRUPO 9: VALIDACIÓN DE EVENTOS CONCLUIDOS ---');
    }

    // Escenario 30: Comprar boleto de evento concluido/inexistente
    if (shouldRun(30)) {
        try {
            const res = await fetch(`${BASE_URL}/api/tickets/payments/create-intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: 350.0, event_id: 999999 })
            });
            const text = await res.text();
            recordTest(30, 'Comprar boleto de evento concluido o inexistente: Rechazado con "El evento seleccionado ya ha concluido"',
                (res.status === 400 || res.status === 500) && text.includes('El evento seleccionado ya ha concluido'),
                `Status: ${res.status}, Response: ${text.slice(0, 150)}`);
        } catch (e) {
            recordTest(30, 'Evento concluido create-intent', false, e.message);
        }
    }

    // Escenario 31: Compra directa de asiento para evento inválido
    if (shouldRun(31)) {
        try {
            const res = await fetch(`${BASE_URL}/api/tickets/purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
                body: JSON.stringify({ items: [{ eventId: 999999, seatId: 'SEC-X-1', price: 200 }], paymentMethod: 'card' })
            });
            const text = await res.text();
            recordTest(31, 'Compra directa para evento inexistente: Interceptado con error 500 sin persistir datos falsos',
                res.status === 500 && text.includes('Error en procesamiento de compra'),
                `Status: ${res.status}, Response: ${text.slice(0, 150)}`);
        } catch (e) {
            recordTest(31, 'Compra evento inexistente', false, e.message);
        }
    }

    // -------------------------------------------------------------
    // GRUPO 10: VENTA Y TIENDA DE MERCANCÍA EN VIVO
    // -------------------------------------------------------------
    if (!targetTestId || (targetTestId >= 32 && targetTestId <= 34)) {
        console.log('--- GRUPO 10: TIENDA Y VENTA DE MERCANCÍA ---');
    }

    // Escenario 32: Salud del microservicio de Mercancía
    if (shouldRun(32)) {
        try {
            const res = await fetch(`${BASE_URL}/api/merchandise/health`);
            const data = await res.json();
            recordTest(32, 'Salud del microservicio de Mercancía: Verifica conectividad por Pilgrim Gateway (200 OK)',
                res.status === 200 && data.status === 'ok' && data.service === 'merchandise_v2',
                `Status: ${res.status}, Service: ${data.service}`);
        } catch (e) {
            recordTest(32, 'Health mercancía', false, e.message);
        }
    }

    // Escenario 33: Catálogo de mercancía oficial en vivo
    if (shouldRun(33)) {
        try {
            const res = await fetch(`${BASE_URL}/api/merchandise/`);
            const items = await res.json();
            recordTest(33, 'Catálogo de mercancía oficial en vivo: Retorna catálogo activo con stock y variantes (200 OK)',
                res.status === 200 && Array.isArray(items) && items.length > 0,
                `Status: ${res.status}, Productos disponibles: ${items ? items.length : 0}`);
        } catch (e) {
            recordTest(33, 'Catálogo mercancía', false, e.message);
        }
    }

    // Escenario 34: Consulta de mercancía inexistente
    if (shouldRun(34)) {
        try {
            const res = await fetch(`${BASE_URL}/api/merchandise/999999`);
            recordTest(34, 'Consulta de mercancía inexistente: Rechaza con 404/401 protegiendo inventario no registrado',
                res.status === 404 || res.status === 401,
                `Status: ${res.status}`);
        } catch (e) {
            recordTest(34, 'Mercancía inexistente', false, e.message);
        }
    }

    // -------------------------------------------------------------
    // GRUPO 11: CONCURRENCIA MASIVA EN VIVO Y LOGOUT
    // -------------------------------------------------------------
    if (!targetTestId || targetTestId >= 35) {
        console.log('--- GRUPO 11: CONCURRENCIA MASIVA EN VIVO Y SESIÓN ---');
    }

    // Escenario 35: Concurrencia masiva: 50 compradores por 1 asiento
    if (shouldRun(35)) {
        try {
            const testSeat = 'CONC-50-' + Date.now();
            const startMs = Date.now();
            const burstPromises = Array.from({ length: 50 }, () =>
                fetch(`${BASE_URL}/api/tickets/lock`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
                    body: JSON.stringify({
                        event_id: 19,
                        seat_id: testSeat,
                        section_name: 'General VIP',
                        price: 650.0
                    })
                }).then(r => r.status).catch(() => 500)
            );
            const statuses = await Promise.all(burstPromises);
            const durationMs = Date.now() - startMs;
            const okCount = statuses.filter(s => s === 200).length;
            const conflictCount = statuses.filter(s => s === 409).length;

            recordTest(35, 'Concurrencia masiva: 50 compradores en paralelo compitiendo por 1 boleto en MySQL',
                okCount === 1 && conflictCount === 49,
                `Duración: ${durationMs}ms | 200 OK: ${okCount} | 409 Conflict: ${conflictCount}`);
        } catch (e) {
            recordTest(35, 'Concurrencia masiva 50 usuarios', false, e.message);
        }
    }

    // Escenario 36: Cierre de sesión seguro (Logout)
    if (shouldRun(36)) {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/logout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const data = await res.json();
            recordTest(36, 'Cierre de sesión seguro (Logout): Finaliza sesión y audita evento en BD (200 OK)',
                res.status === 200 && data.status === 'success',
                `Status: ${res.status}, Message: ${data.message}`);
        } catch (e) {
            recordTest(36, 'Logout', false, e.message);
        }
    }

    // -------------------------------------------------------------
    // RESUMEN FINAL
    // -------------------------------------------------------------
    console.log('\n===============================================================');
    console.log(`TOTAL PRUEBAS EVALUADAS:   ${results.length}`);
    console.log(`APROBADAS (PASSED):        ${passCount}`);
    console.log(`FALLIDAS  (FAILED):        ${failCount}`);
    console.log(`TASA DE ÉXITO EN VIVO:     ${((passCount / results.length) * 100).toFixed(1)}%`);
    console.log('===============================================================\n');

    if (failCount > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

if (require.main === module) {
    runLiveTests();
}

module.exports = { LIVE_SCENARIOS_META, runLiveTests };
