import { apiClient } from './apiClient';

export const transferAPI = {
  /**
   * Inicia el proceso de transferencia. Requiere la contraseña del usuario para
   * confirmar identidad. Retorna un token temporal válido por 10 minutos.
   * @param {Object} data - { ticket_id, password }
   */
  initiate: (data) => apiClient.post('/tickets/transfer/initiate', data),

  /**
   * Recupera la información pública del boleto asociado al token de transferencia.
   * @param {string} token
   */
  getInfo: (token) => apiClient.get(`/tickets/transfer/${token}`),

  /**
   * Reclama el boleto en nombre del usuario autenticado actual.
   * @param {string} token
   */
  claim: (token) => apiClient.post(`/tickets/transfer/${token}/claim`, {}),
};

export default transferAPI;
