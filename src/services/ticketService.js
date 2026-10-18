/**
 * TicketService - Manejo de boletos y pagos
 */
import { apiClient } from './apiClient'

export const ticketAPI = {
    purchase: purchaseData => apiClient.post('/tickets/purchase', purchaseData),
    getMyTickets: () => apiClient.get('/tickets/my-tickets'),
    getBusySeats: (eventId, functionId = null) => {
        const url = functionId ? `/tickets/busy-seats/${eventId}?function_id=${functionId}` : `/tickets/busy-seats/${eventId}`;
        return apiClient.get(url);
    },
    verify: (ticketCodeOrObj, context = {}) => {
        const payload = typeof ticketCodeOrObj === 'object' ? ticketCodeOrObj : { ticketCode: ticketCodeOrObj, ...context };
        return apiClient.post('/tickets/verify', payload);
    },
    redeem: (ticketCodeOrObj, context = {}) => {
        const payload = typeof ticketCodeOrObj === 'object' ? ticketCodeOrObj : { ticketCode: ticketCodeOrObj, ...context };
        return apiClient.post('/tickets/redeem', payload);
    },
    getValidationHistory: () => apiClient.get('/tickets/validations/history'),
    getTicketHistory: (ticketCode) => apiClient.get(`/tickets/validations/ticket/${ticketCode}`),
    getByCode: ticketCode => apiClient.get(`/tickets/${ticketCode}`),
    cancel: ticketId => apiClient.delete(`/tickets/${ticketId}`),
    lockSeat: (eventId, functionId, seatId, sectionName, price) => 
        apiClient.post('/tickets/lock', { eventId, functionId, seatId, sectionName, price }),
    unlockSeat: (eventId, functionId, seatId) => 
        apiClient.delete('/tickets/lock', { data: { eventId, functionId, seatId } }),
    refund: refundData => apiClient.post('/refunds', refundData),
    luckySeatAssign: (eventId, data) => apiClient.post('/tickets/lucky-seat/assign', { event_id: eventId, ...data }),
    resendTicket: (ticketCode) => apiClient.post(`/tickets/${ticketCode}/resend`)
}

export const paymentAPI = {
    createIntent: paymentData => apiClient.post('/payments/create-intent', paymentData),
    confirm: paymentId => apiClient.post(`/payments/${paymentId}/confirm`),
    getHistory: () => apiClient.get('/payments/history'),
    refund: paymentId => apiClient.post(`/payments/${paymentId}/refund`)
}

export const refundAPI = {
    checkPolicy: eventId => apiClient.get(`/refunds/policy/${eventId}`),
    getQuote: ticketId => apiClient.get(`/refunds/quote/${ticketId}`),
    requestRefund: (ticketIdOrObj, reason) => {
        let rawId = typeof ticketIdOrObj === 'object'
            ? (ticketIdOrObj.ticketId || ticketIdOrObj.ticket_id || ticketIdOrObj.id)
            : ticketIdOrObj;
        const parsedId = !isNaN(Number(rawId)) ? Number(rawId) : rawId;
        const rReason = typeof ticketIdOrObj === 'object' ? (ticketIdOrObj.reason || reason) : reason;
        const rDetail = typeof ticketIdOrObj === 'object' ? ticketIdOrObj.detail : undefined;
        return apiClient.post('/refunds/request', {
            ticket_id: parsedId,
            reason: rReason || 'Cancelación solicitada por el usuario',
            detail: rDetail
        });
    },
    getMyRefunds: () => apiClient.get('/refunds/my-refunds'),
    getMyRequests: () => apiClient.get('/refunds/my-requests')
}
