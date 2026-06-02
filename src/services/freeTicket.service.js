/**
 * @module freeTicket.service
 * @description Capa de API para la adquisición directa de boletos gratuitos.
 * Omite completamente el carrito y la pasarela de pagos.
 */
import { apiClient } from './apiClient';

export const freeTicketAPI = {
  /**
   * Registra una entrada gratuita directamente en la Wallet del usuario.
   * El backend valida que el evento tenga precio = 0 antes de crear el boleto.
   *
   * @param {{
   *   eventId: number|string,
   *   sectionName?: string,
   *   sectionId?: string,
   *   functionId?: number,
   *   seatId?: string,
   * }} data
   * @returns {Promise<{ status: string, tickets: Array }>}
   */
  claim: (data) => apiClient.post('/tickets/free', data),
};

export default freeTicketAPI;
