import { useState, useCallback } from 'react';

/**
 * useDirectPayment — Gestiona el flujo de pago directo (sin carrito).
 *
 * Extrae de EventDetail.jsx:
 *  - confirmDirectPayment (flujo completo con seats o general)
 *  - paymentMethod / setPaymentMethod
 *  - cardData / setCardData / handleCardChange
 *
 * @param {object} deps — dependencias inyectadas desde el orquestador
 */
export function useDirectPayment({
  id,
  event,
  ticketEngine,
  addBusySeats,
  fetchBusySeats,
  resetLock,
  notifications,
  api,
  cleanPrice,
}) {
  const { success, error } = notifications;

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '' });

  const handleCardChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === 'number') {
      setCardData((prev) => ({ ...prev, number: value.replace(/\D/g, '').slice(0, 16) }));
    } else if (name === 'expiry') {
      let val = value.replace(/\D/g, '');
      if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
      setCardData((prev) => ({ ...prev, expiry: val }));
    } else if (name === 'cvv') {
      setCardData((prev) => ({ ...prev, cvv: value.replace(/\D/g, '').slice(0, 4) }));
    }
  }, []);

  const confirmDirectPayment = useCallback(async (method) => {
    ticketEngine.setIsProcessingPayment(true);
    try {
      const unitPrice = cleanPrice(
        ticketEngine.directTicketData.section?.price || event?.price
      );
      const amount = unitPrice * ticketEngine.directTicketData.quantity;

      const intentResp = await api.payment.createIntent({
        amount,
        method,
        eventId: id,
        event_id: id,
      });
      const paymentId = intentResp.payment_id || intentResp.reference;

      if (method === 'card') {
        await api.payment.confirm(paymentId);
      }

      const purchaseItems = [];
      const directSeats = ticketEngine.directTicketData.seats;

      if (directSeats && directSeats.length > 0) {
        for (const seat of directSeats) {
          purchaseItems.push({
            eventId: id,
            quantity: 1,
            functionId: ticketEngine.selectedFunction?.id,
            sectionId: ticketEngine.directTicketData.section?.id,
            sectionName: ticketEngine.directTicketData.section?.name,
            price: cleanPrice(
              ticketEngine.directTicketData.section?.price || event?.price
            ),
            seatId: seat,
          });
        }
      } else {
        for (let i = 0; i < ticketEngine.directTicketData.quantity; i++) {
          purchaseItems.push({
            eventId: id,
            quantity: 1,
            functionId: ticketEngine.selectedFunction?.id,
            sectionId: ticketEngine.directTicketData.section?.id,
            sectionName: ticketEngine.directTicketData.section?.name,
            price: cleanPrice(
              ticketEngine.directTicketData.section?.price || event?.price
            ),
            seatId: null,
          });
        }
      }

      await api.ticket.purchase({
        items: purchaseItems,
        paymentMethod: method,
        paymentId,
      });

      resetLock();

      const payload = {
        id: paymentId,
        event: ticketEngine.directTicketData.event,
        section: ticketEngine.directTicketData.section,
        seats: ticketEngine.directTicketData.seats,
        quantity: ticketEngine.directTicketData.quantity,
        total: amount,
      };

      if (ticketEngine.directTicketData.seats?.length > 0) {
        addBusySeats(ticketEngine.directTicketData.seats);
      }

      ticketEngine.setPrintingData(payload);
      ticketEngine.setShowSuccessTicket(true);
      ticketEngine.setSelectedSeats([]);
      ticketEngine.setIsProcessingPayment(false);
      ticketEngine.setShowDirectPayment(false);
      success('¡Compra realizada con éxito!');
    } catch (err) {
      ticketEngine.setIsProcessingPayment(false);
      error(err.response?.data?.detail || 'Error procesando pago');
      // Si el pago falla (ej. asiento ocupado - 409 Conflict), forzamos recarga limpia del mapa
      fetchBusySeats(id, ticketEngine.selectedFunction?.id);
    }
  }, [
    id,
    event,
    ticketEngine,
    addBusySeats,
    fetchBusySeats,
    resetLock,
    success,
    error,
    api,
    cleanPrice,
  ]);

  return {
    paymentMethod,
    setPaymentMethod,
    cardData,
    setCardData,
    handleCardChange,
    confirmDirectPayment,
  };
}
