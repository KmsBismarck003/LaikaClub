import { apiClient } from './apiClient';

export const ticketAPI = {
  purchase: (purchaseData) => apiClient.post('/tickets/purchase', purchaseData),
  getMyTickets: () => apiClient.get('/tickets/my-tickets'),
  getBusySeats: (eventId, functionId = null) => {
    const url = functionId ? `/tickets/busy-seats/${eventId}?function_id=${functionId}` : `/tickets/busy-seats/${eventId}`;
    return apiClient.get(url);
  },
  verify: (ticketCode) => apiClient.post('/tickets/verify', { ticketCode }),
  redeem: (ticketCode) => apiClient.post('/tickets/redeem', { ticketCode }),
  getByCode: (ticketCode) => apiClient.get(`/tickets/${ticketCode}`),
  cancel: (ticketId) => apiClient.delete(`/tickets/${ticketId}`),
  refund: (refundData) => apiClient.post('/refunds', refundData),
  luckySeatAssign: (eventId, data) => apiClient.post('/tickets/lucky-seat/assign', { event_id: eventId, ...data }),
  resendTicket: (ticketCode) => apiClient.post(`/tickets/${ticketCode}/resend`),
};

export const paymentAPI = {
  createIntent: (paymentData) => apiClient.post('/payments/create-intent', paymentData),
  confirm: (paymentId) => apiClient.post(`/payments/${paymentId}/confirm`),
  getHistory: () => apiClient.get('/payments/history'),
  refund: (paymentId) => apiClient.post(`/payments/${paymentId}/refund`),
};

export const refundAPI = {
  checkPolicy: (eventId) => apiClient.get(`/refunds/policy/${eventId}`),
  requestRefund: (ticketId, reason) => {
    const body = typeof ticketId === 'object'
      ? { ticket_id: ticketId.ticketId || ticketId.ticket_id, reason: ticketId.reason, detail: ticketId.detail }
      : { ticket_id: ticketId, reason: reason };
    return apiClient.post('/refunds/request', body);
  },
  getMyRefunds: () => apiClient.get('/refunds/my-refunds'),
};

export default {
  ticketAPI,
  paymentAPI,
  refundAPI,
};
