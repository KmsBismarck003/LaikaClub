/**
 * @module transferService
 * @description Capa de acceso a la API para el flujo de Transferencia Segura de Boletos.
 * Principio SRP: un servicio, una responsabilidad.
 */
import { apiClient } from './apiClient';

export const transferAPI = {
  /**
   * Inicia el proceso de transferencia dirigida por correo electrónico.
   * Si el usuario existe -> PENDING_ACCEPTANCE.
   * Si no existe -> PENDING_REGISTRATION (con claim_token para invitarlo).
   * @param {{ ticket_id: number, recipient_email: string, password?: string }} data
   * @returns {Promise<{ transfer_id: number, status: string, claim_token: string, recipient_email: string, is_registered_user: boolean, expires_at: string, ticket_code: string, message: string }>}
   */
  request: (data) => apiClient.post('/tickets/transfer/request', data),

  /**
   * Acepta una transferencia de boleto entrante.
   * @param {number} transferId
   * @returns {Promise<{ status: string, message: string, new_ticket_code: string, new_ticket_id: number }>}
   */
  accept: (transferId) => apiClient.post(`/tickets/transfer/${transferId}/accept`, {}),

  /**
   * Rechaza una transferencia entrante, devolviendo el boleto al remitente.
   * @param {number} transferId
   * @returns {Promise<{ status: string, message: string }>}
   */
  reject: (transferId) => apiClient.post(`/tickets/transfer/${transferId}/reject`, {}),

  /**
   * Cancela una transferencia saliente pendiente (por parte del remitente).
   * @param {number} transferId
   * @returns {Promise<{ status: string, message: string }>}
   */
  cancel: (transferId) => apiClient.post(`/tickets/transfer/${transferId}/cancel`, {}),

  /**
   * Reclama un boleto vía claim_token (usado en el autoregistro de nuevos usuarios).
   * @param {string} claimToken
   * @returns {Promise<{ status: string, message: string, new_ticket_code: string, new_ticket_id: number }>}
   */
  claimByToken: (claimToken) => apiClient.post(`/tickets/transfer/claim/${claimToken}`, {}),

  /**
   * Obtiene la información pública del reclamo para mostrarla en la pantalla de registro/onboarding.
   * @param {string} claimToken
   * @returns {Promise<{ claim_token: string, transfer_id: number, sender_name: string, recipient_email: string, event_name: string, event_date: string, venue: string, section_name: string, expires_at: string }>}
   */
  getClaimInfo: (claimToken) => apiClient.get(`/tickets/transfer/claim-info/${claimToken}`),

  /**
   * Consulta transferencias entrantes pendientes del usuario logueado.
   * @returns {Promise<Array<{ id: number, claim_token: string, sender_email: string, status: string, event_name: string, event_date: string, venue: string, section_name: string, expires_at: string }>>}
   */
  getIncoming: () => apiClient.get('/tickets/transfer/incoming'),

  /**
   * Consulta transferencias salientes pendientes enviadas por el usuario logueado.
   * @returns {Promise<Array<{ id: number, ticket_id: number, recipient_email: string, claim_token: string, status: string, event_name: string, expires_at: string }>>}
   */
  getOutgoing: () => apiClient.get('/tickets/transfer/outgoing'),

  /**
   * Consulta el historial completo de transferencias (entrantes y salientes).
   * @returns {Promise<Array<any>>}
   */
  getHistory: () => apiClient.get('/tickets/transfer/history'),

  // --- MÉTODOS LEGACY ---
  initiate: (data) => apiClient.post('/tickets/transfer/initiate', data),
  getInfo: (token) => apiClient.get(`/tickets/transfer/${token}`),
  claim: (token) => apiClient.post(`/tickets/transfer/${token}/claim`, {}),
};

export default transferAPI;
