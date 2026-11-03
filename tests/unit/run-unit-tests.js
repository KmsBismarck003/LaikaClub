/**
 * EJECUTOR AUTOCONTENIDO DE PRUEBAS UNITARIAS
 * Ejecuta 35 pruebas unitarias cubriendo autenticación, seguridad, compras y boletos.
 * Uso: node tests/unit/run-unit-tests.js
 */

const {
    validateEmail,
    checkEmailAvailability,
    validatePasswordStrength,
    validatePasswordMatch,
    detectSqlInjection,
    detectXssThreats,
    sanitizeInput
} = require('./authValidation');

const {
    TICKET_STATUS_CODES,
    verifyTicketAccess,
    redeemTicket,
    SeatLockManager,
    processPurchaseIntent,
    isValidCreditCard,
    isValidCVV,
    validateTicketTransfer,
    validateEventEligibility
} = require('./ticketBusinessLogic');

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
console.log('   SUITE DE PRUEBAS UNITARIAS - LAIKA CLUB TEST RUNNER');
console.log('===============================================================\n');

// -------------------------------------------------------------
// GRUPO 1: VALIDACIÓN DE CORREO Y REGISTRO (Pruebas 1 a 4)
// -------------------------------------------------------------
console.log('--- GRUPO 1: VALIDACIÓN DE CORREO Y REGISTRO ---');

// Caso 1: Correo válido estándar
const email1 = validateEmail('fan.laika@gmail.com');
assert('Correo válido estándar debe ser aceptado', email1.valid === true);

// Caso 2: Formatos inválidos de correo
const email2 = validateEmail('correo_sin_arroba.com');
const email3 = validateEmail('usuario@@doblearroba.com');
assert('Correo sin @ o malformado debe ser rechazado', !email2.valid && !email3.valid);

// Caso 3: Detección de correo duplicado
const existingDB = ['admin@laikaclub.com', 'socio@gmail.com'];
const dupCheck = checkEmailAvailability('socio@gmail.com', existingDB);
assert('Detección de correo duplicado ya existente', dupCheck.available === false);

// Caso 4: Correo disponible para nuevo registro
const newEmailCheck = checkEmailAvailability('nuevo.usuario@outlook.com', existingDB);
assert('Correo nuevo debe indicar disponibilidad', newEmailCheck.available === true);

// -------------------------------------------------------------
// GRUPO 2: CONTRASEÑAS Y SEGURIDAD (Pruebas 5 a 8)
// -------------------------------------------------------------
console.log('\n--- GRUPO 2: SEGURIDAD Y ROBUSTEZ DE CONTRASEÑA ---');

// Caso 5: Contraseña débil por longitud corta
const pwdWeak = validatePasswordStrength('12345');
assert('Contraseña menor a 8 caracteres debe ser rechazada', !pwdWeak.valid);

// Caso 6: Contraseña sin caracteres especiales
const pwdNoSpecial = validatePasswordStrength('LaikaClub2026');
assert('Contraseña sin caracteres especiales debe fallar', !pwdNoSpecial.valid);

// Caso 7: Contraseña robusta válida
const pwdStrong = validatePasswordStrength('Laika#Club2026!');
assert('Contraseña con mayúsculas, minúsculas, números y símbolos debe ser aprobada', pwdStrong.valid === true);

// Caso 8: Validación de discrepancia entre contraseña y confirmación
const matchCheck = validatePasswordMatch('Laika#Club2026!', 'Laika#Club2026Diferente');
assert('Discrepancia en confirmación de contraseña debe ser bloqueada', matchCheck.match === false);

// -------------------------------------------------------------
// GRUPO 3: CARACTERES PROHIBIDOS Y SANITIZACIÓN (Pruebas 9 a 12)
// -------------------------------------------------------------
console.log('\n--- GRUPO 3: CARACTERES PROHIBIDOS, XSS Y SQL INJECTION ---');

// Caso 9: Inyección SQL básica en formulario
const sql1 = detectSqlInjection("' OR '1'='1");
assert('Detección de inyección SQL clásica (" OR 1=1)', sql1.safe === false);

// Caso 10: Inyección SQL destructiva (DROP TABLE)
const sql2 = detectSqlInjection('admin; DROP TABLE users; --');
assert('Detección de comando destructivo SQL DROP TABLE', sql2.safe === false);

// Caso 11: Detección de ataque XSS con etiqueta script
const xssCheck = detectXssThreats('<script>alert("XSS")</script>');
assert('Detección de vector XSS <script>', xssCheck.safe === false);

// Caso 12: Sanitización y limpieza de tags HTML y caracteres de control
const sanitized = sanitizeInput('<b>Bienvenido</b>\u0000 socio');
assert('Sanitización remueve tags HTML y caracteres nulos', sanitized === 'Bienvenido socio');

// -------------------------------------------------------------
// GRUPO 4: REGLAS DE NEGOCIO DE BOLETOS (Pruebas 13 a 18)
// -------------------------------------------------------------
console.log('\n--- GRUPO 4: REGLAS DE NEGOCIO Y ESTADOS DE BOLETOS ---');

// Caso 13: Verificación de boleto inexistente
const fakeTicket = verifyTicketAccess(null);
assert('Boleto nulo o inexistente retorna INVALID_CODE', fakeTicket.statusCode === TICKET_STATUS_CODES.INVALID_CODE);

// Caso 14: Verificación de boleto activo y vigente
const activeTicket = { ticketCode: 'LK-2026-VIP-991', status: 'active' };
const activeCheck = verifyTicketAccess(activeTicket);
assert('Boleto activo autoriza acceso (VALID_ACCESS)', activeCheck.valid && activeCheck.actionable);

// Caso 15: Prevención de doble canje (Boleto ya usado)
const usedTicket = { ticketCode: 'LK-2026-GEN-002', status: 'used', redeemedAt: '2026-10-28T01:30:00Z' };
const usedCheck = verifyTicketAccess(usedTicket);
assert('Boleto previamente canjeado rechaza reingreso (ALREADY_REDEEMED)', usedCheck.statusCode === TICKET_STATUS_CODES.ALREADY_REDEEMED);

// Caso 16: Boleto cancelado o reembolsado
const cancelledTicket = { ticketCode: 'LK-2026-REF-554', status: 'cancelled' };
const cancelledCheck = verifyTicketAccess(cancelledTicket);
assert('Boleto cancelado es denegado permanentemente (REVOKED_TICKET)', cancelledCheck.statusCode === TICKET_STATUS_CODES.REVOKED_TICKET);

// Caso 17: Boleto transferido a otro usuario
const transferredTicket = { ticketCode: 'LK-2026-TRF-110', status: 'transferred' };
const transferredCheck = verifyTicketAccess(transferredTicket);
assert('Boleto transferido invalida el QR original (TRANSFERRED_TICKET)', transferredCheck.statusCode === TICKET_STATUS_CODES.TRANSFERRED_TICKET);

// Caso 18: Cortesía pendiente de canje
const courtesyTicket = { ticketCode: 'LK-2026-CRT-880', status: 'pending_claim' };
const courtesyCheck = verifyTicketAccess(courtesyTicket);
assert('Cortesía no reclamada deniega acceso en puerta (PENDING_CLAIM)', courtesyCheck.statusCode === TICKET_STATUS_CODES.PENDING_CLAIM);

// -------------------------------------------------------------
// GRUPO 5: COMPRAS, ASIENTOS Y DOBLE COMPRA (Pruebas 19 a 25)
// -------------------------------------------------------------
console.log('\n--- GRUPO 5: COMPRAS, BLOQUEO DE ASIENTOS Y DOBLE COMPRA ---');

// Caso 19: Canje exitoso de boleto muta a estado 'used'
const freshTicket = { ticketCode: 'LK-2026-CANJE-01', status: 'active' };
const redeemResult = redeemTicket(freshTicket, { operatorId: 'OP-44', accessPoint: 'PUERTA-NORTE' });
assert('Canje exitoso cambia estado a used y registra operador', redeemResult.success && redeemResult.ticket.status === 'used');

// Caso 20: Intento de canje consecutivo sobre el boleto recién canjeado
const secondRedeem = redeemTicket(redeemResult.ticket);
assert('Segundo intento de canje consecutivo es bloqueado', secondRedeem.success === false);

// Caso 21: Bloqueo de asiento temporal por Usuario A
const lockManager = new SeatLockManager(1000); // 1 segundo de timeout para pruebas
const lockUserA = lockManager.lockSeat('user-101', 19, 'A-12', 1800);
assert('Usuario A aparta exitosamente el asiento A-12', lockUserA.success === true);

// Caso 22: Usuario B intenta apartar el mismo asiento A-12 (Colisión)
const lockUserB = lockManager.lockSeat('user-202', 19, 'A-12', 1800);
assert('Usuario B es bloqueado al intentar apartar asiento ocupado', lockUserB.statusCode === TICKET_STATUS_CODES.SEAT_ALREADY_LOCKED);

// Caso 23: Prevención de compra con carrito vacío
const emptyPurchase = processPurchaseIntent('user-101', []);
assert('Intento de compra con carrito vacío es rechazado', emptyPurchase.success === false);

// Caso 24: Prevención de compra con precio negativo o cero
const invalidPricePurchase = processPurchaseIntent('user-101', [{ eventId: 19, seatId: 'B-01', price: -500 }]);
assert('Compra con precio negativo o nulo es rechazada', invalidPricePurchase.success === false);

// Caso 25: Prevención de doble compra simultánea (Race Condition simulada)
const soldHistory = new Set(['19:A-12', '19:B-05']);
const doublePurchase = processPurchaseIntent('user-101', [{ eventId: 19, seatId: 'A-12', price: 1800 }], soldHistory);
assert('Intento de compra de un asiento ya vendido previene doble compra (DOUBLE_PURCHASE_PREVENTED)', doublePurchase.statusCode === TICKET_STATUS_CODES.DOUBLE_PURCHASE_PREVENTED);

// -------------------------------------------------------------
// GRUPO 5: VALIDACIÓN DE TARJETAS DE CRÉDITO (LUHN), TRANSFERENCIAS Y EVENTOS CONCLUIDOS
// -------------------------------------------------------------
console.log('\n--- GRUPO 5: TARJETAS (LUHN), TRANSFERENCIAS Y EVENTOS CONCLUIDOS ---');

// Caso 26: Tarjeta con checksum Luhn válido
assert('Tarjeta de crédito con checksum Luhn válido es aceptada (4532015112830366)', isValidCreditCard('4532015112830366') === true);

// Caso 27: Tarjeta con checksum Luhn inválido
assert('Tarjeta con checksum Luhn alterado o erróneo es rechazada (4532015112830367)', isValidCreditCard('4532015112830367') === false);

// Caso 28: Tarjeta con formato o longitud insuficiente
assert('Tarjeta con menos de 13 dígitos o letras es rechazada', isValidCreditCard('4532abc') === false && isValidCreditCard('123456789') === false);

// Caso 29: Validación estricta de código de seguridad CVV
assert('CVV de 3 y 4 dígitos es válido, mientras que valores alfanuméricos o cortos son rechazados', 
    isValidCVV('123') === true && isValidCVV('1234') === true && isValidCVV('12') === false && isValidCVV('abc') === false);

// Caso 30: Transferencia a sí mismo prohibida
const selfTransfer = validateTicketTransfer({ id: 10, status: 'active', isCourtesy: false }, 'comprador@laikaclub.com', 'comprador@laikaclub.com');
assert('Transferencia dirigida al mismo remitente es rechazada (SELF_TRANSFER_PROHIBITED)', selfTransfer.allowed === false && selfTransfer.error === 'SELF_TRANSFER_PROHIBITED');

// Caso 31: Transferencia de boleto de cortesía prohibida
const courtesyTransfer = validateTicketTransfer({ id: 11, status: 'active', isCourtesy: true }, 'admin@laikaclub.com', 'amigo@laikaclub.com');
assert('Transferencia de boleto de cortesía es rechazada (COURTESY_TRANSFER_FORBIDDEN)', courtesyTransfer.allowed === false && courtesyTransfer.error === 'COURTESY_TRANSFER_FORBIDDEN');

// Caso 32: Transferencia de boleto inactivo (usado, cancelado o reembolsado)
const usedTicketTransfer = validateTicketTransfer({ id: 12, status: 'used', isCourtesy: false }, 'admin@laikaclub.com', 'amigo@laikaclub.com');
assert('Transferencia de un boleto ya utilizado es rechazada (INACTIVE_TICKET)', usedTicketTransfer.allowed === false && usedTicketTransfer.error === 'INACTIVE_TICKET');

// Caso 33: Transferencia legítima entre dos usuarios distintos
const validTransfer = validateTicketTransfer({ id: 13, status: 'active', isCourtesy: false }, 'remitente@laikaclub.com', 'destinatario@laikaclub.com');
assert('Transferencia legítima de boleto activo entre distintos usuarios es autorizada', validTransfer.allowed === true);

// Caso 34: Intento de compra o reembolso para evento concluido en el pasado
const pastEvent = validateEventEligibility('2020-01-01T20:00:00');
assert('Evento con fecha concluida en el pasado es rechazado para transacciones', pastEvent.eligible === false);

// Caso 35: Evento futuro con fecha vigente elegible
const futureEvent = validateEventEligibility('2030-12-31T20:00:00');
assert('Evento con fecha futura vigente es elegible para compra de boletos', futureEvent.eligible === true);


// -------------------------------------------------------------
// REPORTE DE RESUMEN
// -------------------------------------------------------------
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
