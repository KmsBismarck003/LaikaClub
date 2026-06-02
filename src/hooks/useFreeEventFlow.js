/**
 * @hook useFreeEventFlow
 * @description Hook que encapsula la adquisición directa de un boleto gratuito.
 * Detecta si el evento es gratuito y expone un handler que salta carrito/pagos.
 *
 * Principio SRP: lógica de eventos gratuitos separada del engine general de boletos.
 */
import { useState, useCallback, useMemo } from 'react';
import { freeTicketAPI } from '../services/freeTicket.service';
import { cleanPrice } from '../pages/EventDetail/utils/helpers';

/**
 * @param {Object} event           - Objeto evento del backend
 * @param {Object} selectedSection - Sección/zona seleccionada
 * @param {Function} success       - Notification de éxito
 * @param {Function} error         - Notification de error
 * @param {Function} onSuccess     - Callback tras adquisición exitosa (recibe ticketData)
 */
export function useFreeEventFlow(event, selectedSection, { success, error }, onSuccess) {
  const [loading, setLoading] = useState(false);

  /**
   * Determina si el evento es gratuito basándose en:
   * - Flag is_free explícito del backend
   * - Precio igual a 0 en el evento
   * - Precio igual a 0 en la sección seleccionada
   */
  const isFreeEvent = useMemo(() => {
    if (!event) return false;
    if (event.is_free === true) return true;
    const eventPrice   = cleanPrice(event.price ?? 0);
    const sectionPrice = cleanPrice(selectedSection?.price ?? eventPrice);
    return sectionPrice === 0;
  }, [event, selectedSection]);

  /**
   * Registra la entrada gratuita en el backend.
   * No abre ningún modal de pago ni redirige al carrito.
   */
  const claimFreeTicket = useCallback(async (overrides = {}) => {
    if (!isFreeEvent || !event) return;
    setLoading(true);
    try {
      const payload = {
        eventId:      event.id,
        sectionName:  selectedSection?.name || 'General',
        sectionId:    selectedSection?.id,
        functionId:   overrides.functionId ?? null,
        seatId:       overrides.seatId ?? null,
      };
      const result = await freeTicketAPI.claim(payload);
      success('Entrada registrada en tu Wallet');
      onSuccess?.(result);
    } catch (err) {
      const msg = err?.message || err?.data?.detail || 'Error al registrar la entrada';
      error(msg);
    } finally {
      setLoading(false);
    }
  }, [isFreeEvent, event, selectedSection, success, error, onSuccess]);

  return { isFreeEvent, claimFreeTicket, loading };
}
