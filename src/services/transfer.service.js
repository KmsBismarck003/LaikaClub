/**
 * @module transferService
 * @description Capa de acceso a la API para el flujo de Transferencia Segura de Boletos.
 * Principio SRP: un servicio, una responsabilidad.
 */
import { apiClient } from './apiClient';

export const transferAPI = {
  /**
   * Inicia el proceso de transferencia. Requiere la contraseña del usuario para
   * confirmar identidad. Retorna un token temporal válido por 10 minutos.
   * @param {{ ticket_id: number, password: string }} data
   * @returns {Promise<{ token: string, expires_at: string, expires_in_seconds: number }>}
   */
  initiate: (data) => apiClient.post('/tickets/transfer/initiate', data),

  /**
   * Recupera la información pública del boleto asociado al token de transferencia.
   * Esta endpoint es pública (no requiere auth) para que el receptor pueda ver el boleto.
   * @param {string} token
   * @returns {Promise<{ owner_name, event_name, section_name, ticket_code, seconds_left }>}
   */
  getInfo: (token) => apiClient.get(`/tickets/transfer/${token}`),

  /**
   * Reclama el boleto en nombre del usuario autenticado actual.
   * Invalida el QR viejo y genera uno nuevo en la cuenta del receptor.
   * @param {string} token
   * @returns {Promise<{ status: string, new_ticket_code: string }>}
   */
  claim: (token) => apiClient.post(`/tickets/transfer/${token}/claim`, {}),
};

export default transferAPI;
