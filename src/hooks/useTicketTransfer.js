/**
 * @hook useTicketTransfer
 * @description Máquina de estados para el flujo de Transferencia Segura de Boletos.
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
  CONFIRMING:  'confirming', // usuario ingresa contraseña
  GENERATING:  'generating', // llamada API en curso
  DONE:        'done',        // token generado, mostrando QR/link
  ERROR:       'error',
};

/**
 * @param {{ success: Function, error: Function }} notifications
 */
export function useTicketTransfer({ success, error: showError }) {
  const [phase,    setPhase]    = useState(TRANSFER_PHASE.IDLE);
  const [ticket,   setTicket]   = useState(null);   // boleto activo en transferencia
  const [password, setPassword] = useState('');
  const [tokenData,setTokenData]= useState(null);   // { token, expires_at, expires_in_seconds }
  const [errorMsg, setErrorMsg] = useState('');
  const [loading,  setLoading]  = useState(false);

  // Countdown timer
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef(null);

  /** Abre el modal de confirmación para un boleto dado. */
  const openTransfer = useCallback((ticketObj) => {
    setTicket(ticketObj);
    setPhase(TRANSFER_PHASE.CONFIRMING);
    setPassword('');
    setErrorMsg('');
    setTokenData(null);
  }, []);

  /** Cancela y resetea todo el estado. */
  const cancelTransfer = useCallback(() => {
    clearInterval(timerRef.current);
    setPhase(TRANSFER_PHASE.IDLE);
    setTicket(null);
    setPassword('');
    setTokenData(null);
    setErrorMsg('');
    setSecondsLeft(0);
  }, []);

  /** Envía la contraseña al backend y solicita el token de transferencia. */
  const confirmAndGenerate = useCallback(async () => {
    if (!ticket) return;
    if (!password.trim()) {
      setErrorMsg('Ingresa tu contraseña para continuar');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setPhase(TRANSFER_PHASE.GENERATING);

    try {
      const data = await transferAPI.initiate({
        ticket_id: ticket.id,
        password,
      });

      setTokenData(data);
      setSecondsLeft(data.expires_in_seconds || 600);
      setPhase(TRANSFER_PHASE.DONE);
      success('Enlace de transferencia generado');

      // Iniciar countdown
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      const msg = err?.message || err?.data?.detail || 'Error al generar el enlace';
      setErrorMsg(msg);
      setPhase(TRANSFER_PHASE.CONFIRMING);
      showError(msg);
    } finally {
      setLoading(false);
    }
  }, [ticket, password, success, showError]);

  /** Construye la URL de reclamación que el receptor debe abrir. */
  const claimUrl = tokenData
    ? `${window.location.origin}/ticket/claim/${tokenData.token}`
    : null;

  return {
    phase,
    ticket,
    password,
    setPassword,
    tokenData,
    claimUrl,
    secondsLeft,
    errorMsg,
    loading,
    openTransfer,
    cancelTransfer,
    confirmAndGenerate,
  };
}
