/**
 * @hook useTicketTransfer
 * @description Máquina de estados para el flujo de Transferencia Segura de Boletos de LAIKA Club.
 * 
 * Fases:
 *   idle → confirming → generating → done | error
 *
 * Principio SRP: la lógica de la transferencia está aislada de la UI.
 */
import { useState, useCallback, useRef } from 'react';
import { transferAPI } from '../services/transfer.service';

export const TRANSFER_PHASE = {
  IDLE:        'idle',
  CONFIRMING:  'confirming', // usuario ingresa correo destinatario y contraseña
  GENERATING:  'generating', // llamada API en curso
  DONE:        'done',        // transferencia registrada, mostrando confirmación / link para no registrados
  ERROR:       'error',
};

/**
 * @param {{ success: Function, error: Function, onComplete?: Function }} notifications
 */
export function useTicketTransfer({ success, error: showError, onComplete }) {
  const [phase,          setPhase]          = useState(TRANSFER_PHASE.IDLE);
  const [ticket,         setTicket]         = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [password,       setPassword]       = useState('');
  const [transferData,   setTransferData]   = useState(null); // resultado de transferAPI.request
  const [errorMsg,       setErrorMsg]       = useState('');
  const [loading,        setLoading]        = useState(false);

  // Countdown timer
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef(null);

  /** Abre el modal de transferencia para un boleto dado. */
  const openTransfer = useCallback((ticketObj) => {
    setTicket(ticketObj);
    setPhase(TRANSFER_PHASE.CONFIRMING);
    setRecipientEmail('');
    setPassword('');
    setErrorMsg('');
    setTransferData(null);
  }, []);

  /** Cancela y resetea todo el estado. */
  const cancelTransferModal = useCallback(() => {
    clearInterval(timerRef.current);
    setPhase(TRANSFER_PHASE.IDLE);
    setTicket(null);
    setRecipientEmail('');
    setPassword('');
    setTransferData(null);
    setErrorMsg('');
    setSecondsLeft(0);
  }, []);

  /** Envía la solicitud de transferencia al backend. */
  const confirmAndSend = useCallback(async () => {
    if (!ticket) return;

    const emailTrim = recipientEmail.trim();
    if (!emailTrim) {
      setErrorMsg('Ingresa el correo electrónico del destinatario');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrim)) {
      setErrorMsg('El formato del correo electrónico no es válido');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setPhase(TRANSFER_PHASE.GENERATING);

    try {
      const data = await transferAPI.request({
        ticket_id: ticket.id,
        recipient_email: emailTrim,
        password: password.trim(),
      });

      setTransferData(data);
      setSecondsLeft(48 * 3600); // 48 horas
      setPhase(TRANSFER_PHASE.DONE);

      if (data.is_registered_user) {
        success('Solicitud de transferencia enviada al destinatario');
      } else {
        success('Invitación de transferencia generada');
      }

      if (onComplete) {
        onComplete();
      }

    } catch (err) {
      const msg = err?.data?.message || err?.data?.detail || err?.response?.data?.message || err?.message || 'Error al procesar la transferencia';
      setErrorMsg(msg);
      setPhase(TRANSFER_PHASE.CONFIRMING);
      showError(msg);
    } finally {
      setLoading(false);
    }
  }, [ticket, recipientEmail, password, success, showError, onComplete]);

  /** Acepta una transferencia entrante. */
  const acceptIncoming = useCallback(async (transferId) => {
    setLoading(true);
    try {
      const res = await transferAPI.accept(transferId);
      success(res.message || 'Boleto aceptado y guardado en tu Wallet');
      if (onComplete) onComplete();
      return res;
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Error al aceptar la transferencia';
      showError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [success, showError, onComplete]);

  /** Rechaza una transferencia entrante. */
  const rejectIncoming = useCallback(async (transferId) => {
    setLoading(true);
    try {
      const res = await transferAPI.reject(transferId);
      success(res.message || 'Transferencia rechazada');
      if (onComplete) onComplete();
      return res;
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Error al rechazar la transferencia';
      showError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [success, showError, onComplete]);

  /** Cancela una transferencia saliente pendiente. */
  const cancelOutgoing = useCallback(async (transferId) => {
    setLoading(true);
    try {
      const res = await transferAPI.cancel(transferId);
      success(res.message || 'Transferencia cancelada. Tu boleto está activo.');
      if (onComplete) onComplete();
      return res;
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Error al cancelar la transferencia';
      showError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [success, showError, onComplete]);

  /** Construye la URL de reclamo para destinatarios que aún no se registran. */
  const claimUrl = transferData?.claim_token
    ? `${window.location.origin}/register?claim_token=${transferData.claim_token}&email=${encodeURIComponent(transferData.recipient_email || '')}`
    : null;

  return {
    phase,
    ticket,
    recipientEmail,
    setRecipientEmail,
    password,
    setPassword,
    transferData,
    claimUrl,
    secondsLeft,
    errorMsg,
    loading,
    openTransfer,
    cancelTransferModal,
    confirmAndSend,
    acceptIncoming,
    rejectIncoming,
    cancelOutgoing,
  };
}
