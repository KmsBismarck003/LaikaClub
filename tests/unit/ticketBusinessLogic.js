/**
 * LÓGICA DE NEGOCIO DE BOLETOS, ASIENTOS Y PREVENCIÓN DE DOBLE CANJE
 * Simula y audita las reglas de negocio implementadas en ContextualValidationService.java
 */

/**
 * Códigos de estado oficiales del sistema LAIKA Club
 */
const TICKET_STATUS_CODES = {
    VALID_ACCESS: 'VALID_ACCESS',
    ALREADY_REDEEMED: 'ALREADY_REDEEMED',
    REVOKED_TICKET: 'REVOKED_TICKET',
    TRANSFERRED_TICKET: 'TRANSFERRED_TICKET',
    PENDING_CLAIM: 'PENDING_CLAIM',
    INVALID_CODE: 'INVALID_CODE',
    SEAT_ALREADY_LOCKED: 'SEAT_ALREADY_LOCKED',
    SEAT_LOCK_SUCCESS: 'SEAT_LOCK_SUCCESS',
    DOUBLE_PURCHASE_PREVENTED: 'DOUBLE_PURCHASE_PREVENTED'
};

/**
 * Valida el estado de un boleto ante el intento de ingreso en puerta (Torniquete / Operador).
 */
function verifyTicketAccess(ticket, context = {}) {
    if (!ticket || !ticket.ticketCode) {
        return {
            valid: false,
            actionable: false,
            statusCode: TICKET_STATUS_CODES.INVALID_CODE,
            statusTitle: 'CÓDIGO INEXISTENTE',
            message: 'El código del boleto no está registrado en el ecosistema LAIKA Club.'
        };
    }

    const status = (ticket.status || 'active').toLowerCase();

    // 1. Cortesía sin reclamar
    if (status === 'pending_claim') {
        return {
            valid: false,
            actionable: false,
            statusCode: TICKET_STATUS_CODES.PENDING_CLAIM,
            statusTitle: 'CORTESÍA PENDIENTE DE CANJE',
            message: 'ACCESO DENEGADO: Este código de cortesía aún no ha sido canjeado por el titular.'
        };
    }

    // 2. Boleto cancelado o reembolsado
    if (status === 'cancelled' || status === 'refunded') {
        return {
            valid: false,
            actionable: false,
            statusCode: TICKET_STATUS_CODES.REVOKED_TICKET,
            statusTitle: 'BOLETO CANCELADO / REVOCADO',
            message: 'ACCESO DENEGADO: Este boleto fue cancelado o reembolsado. El código QR ha sido invalidado.'
        };
    }

    // 3. Boleto transferido
    if (status === 'transferred') {
        return {
            valid: false,
            actionable: false,
            statusCode: TICKET_STATUS_CODES.TRANSFERRED_TICKET,
            statusTitle: 'ACCESO TRANSFERIDO',
            message: 'La propiedad del boleto fue transferida a otro titular. Este código QR original está inhabilitado.'
        };
    }

    // 4. Boleto ya utilizado (Anti-Doble Ingreso)
    if (status === 'used' || status === 'redeemed') {
        return {
            valid: false,
            actionable: false,
            alreadyUsed: true,
            statusCode: TICKET_STATUS_CODES.ALREADY_REDEEMED,
            statusTitle: 'BOLETO PREVIAMENTE CANJEADO',
            message: `ATENCIÓN: Boleto previamente canjeado en fecha ${ticket.redeemedAt || 'previa'}. Intento de doble ingreso bloqueado.`
        };
    }

    // 5. Boleto vigente y activo
    if (status === 'active') {
        return {
            valid: true,
            actionable: true,
            statusCode: TICKET_STATUS_CODES.VALID_ACCESS,
            statusTitle: 'BOLETO VÁLIDO',
            message: 'Boleto verificado. Listo para autorizar ingreso físico.'
        };
    }

    return {
        valid: false,
        actionable: false,
        statusCode: 'UNKNOWN_STATUS',
        statusTitle: 'ESTADO DESCONOCIDO',
        message: `Estado no reconocido: ${status}`
    };
}

/**
 * Ejecuta el canje de un boleto (Redeem) de forma idempotente y atómica.
 */
function redeemTicket(ticket, operatorContext = {}) {
    const verification = verifyTicketAccess(ticket, operatorContext);
    if (!verification.actionable) {
        return {
            success: false,
            error: verification.statusCode,
            details: verification.message,
            ticket
        };
    }

    // Mutación controlada a estado 'used'
    const redeemedTicket = {
        ...ticket,
        status: 'used',
        redeemedAt: new Date().toISOString(),
        redeemedByOperator: operatorContext.operatorId || 'OP-DEFAULT',
        accessPoint: operatorContext.accessPoint || 'PUERTA-PRINCIPAL'
    };

    return {
        success: true,
        statusCode: 'REDEEMED_SUCCESS',
        message: 'Boleto canjeado exitosamente en puerta. Ingreso autorizado.',
        ticket: redeemedTicket
    };
}

/**
 * Gestor de bloqueo temporal de asientos en memoria (Simula Redis / Lock de Base de Datos).
 */
class SeatLockManager {
    constructor(lockTimeoutMs = 600000) { // 10 minutos por defecto
        this.lockedSeats = new Map();
        this.lockTimeoutMs = lockTimeoutMs;
    }

    getLockKey(eventId, seatId) {
        return `event:${eventId}:seat:${seatId}`;
    }

    /**
     * Intenta apartar o bloquear un asiento para un usuario.
     */
    lockSeat(userId, eventId, seatId, price = 0) {
        const key = this.getLockKey(eventId, seatId);
        const now = Date.now();

        if (this.lockedSeats.has(key)) {
            const currentLock = this.lockedSeats.get(key);
            // Comprueba si el bloqueo ya expiró
            if (now < currentLock.expiresAt) {
                if (currentLock.userId === userId) {
                    return { success: true, message: 'Asiento ya reservado por este mismo usuario', expiresAt: currentLock.expiresAt };
                }
                return {
                    success: false,
                    statusCode: TICKET_STATUS_CODES.SEAT_ALREADY_LOCKED,
                    message: `El asiento ${seatId} se encuentra actualmente bloqueado por otro usuario.`
                };
            }
        }

        // Establecer nuevo bloqueo temporal
        const lockInfo = {
            userId,
            eventId,
            seatId,
            price,
            lockedAt: now,
            expiresAt: now + this.lockTimeoutMs
        };
        this.lockedSeats.set(key, lockInfo);

        return {
            success: true,
            statusCode: TICKET_STATUS_CODES.SEAT_LOCK_SUCCESS,
            message: `Asiento ${seatId} bloqueado exitosamente por ${this.lockTimeoutMs / 1000}s.`,
            expiresAt: lockInfo.expiresAt
        };
    }

    /**
     * Libera un asiento bloqueado.
     */
    unlockSeat(userId, eventId, seatId) {
        const key = this.getLockKey(eventId, seatId);
        if (!this.lockedSeats.has(key)) return { success: true, message: 'El asiento no estaba bloqueado' };
        
        const currentLock = this.lockedSeats.get(key);
        if (currentLock.userId !== userId) {
            return { success: false, message: 'No puedes liberar un asiento bloqueado por otro usuario' };
        }

        this.lockedSeats.delete(key);
        return { success: true, message: `Asiento ${seatId} liberado` };
    }

    /**
     * Verifica si un asiento está disponible para compra.
     */
    isSeatAvailable(eventId, seatId, userId) {
        const key = this.getLockKey(eventId, seatId);
        if (!this.lockedSeats.has(key)) return true;
        const currentLock = this.lockedSeats.get(key);
        if (Date.now() >= currentLock.expiresAt) return true; // Expiró
        return currentLock.userId === userId; // Disponible solo para quien lo apartó
    }
}

/**
 * Validador de intención de pago y prevención de compras duplicadas.
 */
function processPurchaseIntent(userId, items, processedPurchases = new Set()) {
    if (!userId) return { success: false, reason: 'Usuario no autenticado' };
    if (!items || !Array.isArray(items) || items.length === 0) {
        return { success: false, reason: 'El carrito de boletos no puede estar vacío' };
    }

    // Validar montos y unicidad
    for (const item of items) {
        if (!item.seatId || !item.eventId) {
            return { success: false, reason: 'Cada boleto requiere eventId y seatId válido' };
        }
        if (typeof item.price !== 'number' || item.price <= 0) {
            return { success: false, reason: `Precio inválido para el asiento ${item.seatId}: debe ser mayor a 0` };
        }

        // Detección de doble compra simultánea
        const purchaseHash = `${item.eventId}:${item.seatId}`;
        if (processedPurchases.has(purchaseHash)) {
            return {
                success: false,
                statusCode: TICKET_STATUS_CODES.DOUBLE_PURCHASE_PREVENTED,
                reason: `El asiento ${item.seatId} del evento ${item.eventId} ya fue vendido. Compra doble prevenida.`
            };
        }
    }

    return { success: true, itemsCount: items.length };
}

/**
 * Validador de tarjeta de crédito mediante algoritmo de Luhn (ISO/IEC 7812)
 */
function isValidCreditCard(cardNumber) {
    if (!cardNumber || typeof cardNumber !== 'string') return false;
    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.length < 13 || cleaned.length > 19) return false;

    let sum = 0;
    let isEven = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i], 10);
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
    }
    return sum % 10 === 0;
}

/**
 * Validador de código de seguridad CVV (3 o 4 dígitos numéricos)
 */
function isValidCVV(cvv) {
    if (!cvv || typeof cvv !== 'string') return false;
    return /^[0-9]{3,4}$/.test(cvv.trim());
}

/**
 * Valida reglas de negocio para la transferencia de un boleto
 */
function validateTicketTransfer(ticket, senderEmail, recipientEmail) {
    if (!ticket) return { allowed: false, error: 'TICKET_NOT_FOUND', message: 'Boleto no encontrado' };
    if (!recipientEmail || typeof recipientEmail !== 'string' || !recipientEmail.includes('@')) {
        return { allowed: false, error: 'INVALID_RECIPIENT', message: 'Correo de destinatario inválido' };
    }
    if (senderEmail && senderEmail.trim().toLowerCase() === recipientEmail.trim().toLowerCase()) {
        return { allowed: false, error: 'SELF_TRANSFER_PROHIBITED', message: 'No puedes transferirte un boleto a ti mismo' };
    }
    if (ticket.isCourtesy) {
        return { allowed: false, error: 'COURTESY_TRANSFER_FORBIDDEN', message: 'Los boletos de cortesía son de carácter personal y no pueden transferirse' };
    }
    const status = (ticket.status || '').toLowerCase();
    if (['cancelled', 'refunded', 'used', 'redeemed', 'transferred'].includes(status)) {
        return { allowed: false, error: 'INACTIVE_TICKET', message: `Un boleto ${status} no puede transferirse` };
    }
    return { allowed: true, message: 'Transferencia permitida' };
}

/**
 * Valida si un evento es elegible para compra o cancelación (control de fechas concluidas)
 */
function validateEventEligibility(eventDate, deadlineHours = 0) {
    if (!eventDate) return { eligible: false, message: 'Fecha de evento no definida' };
    const eventTime = new Date(eventDate).getTime();
    if (isNaN(eventTime)) return { eligible: false, message: 'Formato de fecha inválido' };
    const now = Date.now();
    const thresholdMs = deadlineHours * 3600 * 1000;
    if (eventTime <= (now + thresholdMs)) {
        return { eligible: false, message: 'El evento seleccionado ya ha concluido o no está disponible para compra/cancelación' };
    }
    return { eligible: true, message: 'Evento elegible' };
}

module.exports = {
    TICKET_STATUS_CODES,
    verifyTicketAccess,
    redeemTicket,
    SeatLockManager,
    processPurchaseIntent,
    isValidCreditCard,
    isValidCVV,
    validateTicketTransfer,
    validateEventEligibility
};

