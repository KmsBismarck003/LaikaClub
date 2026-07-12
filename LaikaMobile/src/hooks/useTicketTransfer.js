import { useState, useCallback, useRef } from 'react';
import { transferAPI } from '../services/transferService';
import { getApiBaseUrl } from '../services/apiClient';

export const TRANSFER_PHASE = {
  IDLE: 'idle',
  CONFIRMING: 'confirming', // user enters password
  GENERATING: 'generating', // API call in progress
  DONE: 'done', // token generated, showing QR/link
  ERROR: 'error',
};

export function useTicketTransfer({ onSuccess, onError }) {
  const [phase, setPhase] = useState(TRANSFER_PHASE.IDLE);
  const [ticket, setTicket] = useState(null); // ticket currently being transferred
  const [password, setPassword] = useState('');
  const [tokenData, setTokenData] = useState(null); // { token, expires_at, expires_in_seconds }
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Countdown timer
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef(null);

  /** Opens the confirmation modal for a given ticket. */
  const openTransfer = useCallback((ticketObj) => {
    setTicket(ticketObj);
    setPhase(TRANSFER_PHASE.CONFIRMING);
    setPassword('');
    setErrorMsg('');
    setTokenData(null);
  }, []);

  /** Cancels and resets all state. */
  const cancelTransfer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setPhase(TRANSFER_PHASE.IDLE);
    setTicket(null);
    setPassword('');
    setTokenData(null);
    setErrorMsg('');
    setSecondsLeft(0);
  }, []);

  /** Submits password to backend and requests transfer token. */
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
      if (onSuccess) {
        onSuccess('Enlace de transferencia generado');
      }

      // Start countdown
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
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
      if (onError) {
        onError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [ticket, password, onSuccess, onError]);

  /** Builds the claim URL that the receiver should open. */
  const claimUrl = tokenData
    ? `${getApiBaseUrl().replace(':8000/api', ':3000')}/ticket/claim/${tokenData.token}`
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
