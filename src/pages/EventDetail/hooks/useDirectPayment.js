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
    const directSeats = ticketEngine.directTicketData?.seats || [];
    const isSeatingMode =
      ticketEngine.isEventSeating || ticketEngine.directTicketData?.section?.type === 'seating';

    if (isSeatingMode && directSeats.length === 0) {
      error('Debes seleccionar al menos un asiento en el mapa antes de pagar.');
      return;
    }

    const resolvedFunctionId =
      ticketEngine.directTicketData?.functionId ||
      ticketEngine.selectedFunction?.id ||
      event?.functions?.[0]?.id ||
      null;

    if (event?.functions?.length > 0 && !resolvedFunctionId) {
      error('Selecciona una función disponible para continuar con la compra.');
      return;
    }

    ticketEngine.setIsProcessingPayment(true);
    try {
      const unitPrice = cleanPrice(
        ticketEngine.directTicketData.section?.price || event?.price
      );
      const qty = isSeatingMode ? directSeats.length : (ticketEngine.directTicketData.quantity || 1);
      const amount = unitPrice * qty;

      const intentResp = await api.payment.createIntent({
        amount,
        method,
        eventId: Number(id) || id,
        event_id: Number(id) || id,
      });
      const paymentId = intentResp.payment_id || intentResp.reference;

      if (method === 'card') {
        await api.payment.confirm(paymentId);
      }

      const purchaseItems = [];
      const numericEventId = Number(id) || id;

      if (directSeats.length > 0) {
        for (const seat of directSeats) {
          purchaseItems.push({
            eventId: numericEventId,
            quantity: 1,
            functionId: resolvedFunctionId,
            sectionId: ticketEngine.directTicketData.section?.id,
            sectionName: ticketEngine.directTicketData.section?.name,
            price: cleanPrice(
              ticketEngine.directTicketData.section?.price || event?.price
            ),
            seatId: seat,
          });
        }
      } else {
        for (let i = 0; i < qty; i++) {
          purchaseItems.push({
            eventId: numericEventId,
            quantity: 1,
            functionId: resolvedFunctionId,
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
        seats: directSeats,
        quantity: qty,
        total: amount,
      };

      if (directSeats.length > 0) {
        addBusySeats(directSeats);
      }

      ticketEngine.setPrintingData(payload);
      ticketEngine.setShowSuccessTicket(true);
      ticketEngine.setSelectedSeats([]);
      ticketEngine.setIsProcessingPayment(false);
      ticketEngine.setShowDirectPayment(false);
      success('Compra realizada con éxito');
    } catch (err) {
      ticketEngine.setIsProcessingPayment(false);
      const errMessage =
        err?.data?.detail ||
        err?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        'Error procesando pago';
      error(errMessage);
      // Si el pago falla (ej. asiento ocupado - 409 Conflict), forzamos recarga limpia del mapa
      fetchBusySeats(id, resolvedFunctionId);
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
