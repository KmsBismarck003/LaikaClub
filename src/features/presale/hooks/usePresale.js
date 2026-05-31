import { useState, useCallback, useMemo } from 'react';
import { isBinAllowed, getPresaleState } from '../utils/binValidator';

const SESSION_KEY_PREFIX = 'laika_presale_unlocked_';

/**
 * usePresale — Hook que encapsula TODA la lógica de preventa exclusiva.
 *
 * Responsabilidades:
 *  - Determinar si el evento está en preventa activa
 *  - Guardar el estado de "desbloqueado" en sessionStorage (persiste durante la sesión)
 *  - Validar el BIN que ingresa el usuario (local + llamada al backend)
 *  - Exponer el BIN de la tarjeta seleccionada para que el Checkout lo envíe al backend
 *
 * @param {Object|null} event - Datos del evento (puede ser null mientras carga).
 * @returns {Object} Estado y acciones de preventa.
 */
export function usePresale(event) {
  const eventId = event?.id;

  // BIN ingresado por el usuario en el presale gate
  const [binInput, setBinInput] = useState('');

  // Estado de la validación
  const [validationError, setValidationError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // BIN confirmado para enviar al checkout (null = sin restricción)
  const [confirmedBin, setConfirmedBin] = useState('');

  // ── Estado de preventa calculado (memoizado para evitar recalcular en cada render) ──
  const presaleState = useMemo(() => {
    if (!event) return { isActive: false, bankName: null, bins: null, start: null, end: null };
    return getPresaleState(event);
  }, [event]);

  // ── Leer si el usuario ya se desbloqueó en esta sesión ──
  const isUnlockedInSession = useMemo(() => {
    if (!eventId) return false;
    return sessionStorage.getItem(`${SESSION_KEY_PREFIX}${eventId}`) === 'true';
  }, [eventId]);

  const [isUnlocked, setIsUnlocked] = useState(isUnlockedInSession);

  // ── ¿El usuario necesita pasar el gate? ──
  const needsPresaleGate = presaleState.isActive && !isUnlocked;

  // ── Guardar desbloqueo en sessionStorage ──
  const markUnlocked = useCallback(
    (bin) => {
      if (eventId) {
        sessionStorage.setItem(`${SESSION_KEY_PREFIX}${eventId}`, 'true');
      }
      setConfirmedBin(bin);
      setIsUnlocked(true);
      setValidationError('');
    },
    [eventId]
  );

  /**
   * Intenta desbloquear el acceso a la preventa.
   * Primero hace validación local (fast), luego llama al backend como confirmación.
   * Si el backend no está disponible, confía en la validación local.
   */
  const attemptUnlock = useCallback(
    async (inputBin) => {
      const bin = (inputBin || binInput).replace(/\D/g, '');

      if (bin.length < 6) {
        setValidationError('Ingresa al menos los primeros 6 dígitos de tu tarjeta.');
        return;
      }

      // 1. Validación local inmediata (sin latencia)
      const localValid = isBinAllowed(bin, presaleState.bins);

      if (!localValid) {
        const bankName = presaleState.bankName || 'el banco patrocinador';
        setValidationError(
          `Tu tarjeta no pertenece a la preventa exclusiva de ${bankName}. Intenta con una tarjeta diferente.`
        );
        return;
      }

      // 2. Confirmación en el backend (opcional pero recomendado para seguridad extra)
      setIsValidating(true);
      try {
        const resp = await fetch(`/api/events/presale/${eventId}/validate-bin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ card_number: bin }),
        });

        const data = await resp.json();
        if (data.valid) {
          markUnlocked(bin);
        } else {
          setValidationError(data.message || 'Tarjeta no válida para esta preventa.');
        }
      } catch {
        // Si el backend falla, confiar en la validación local (tolerancia a fallos)
        markUnlocked(bin);
      } finally {
        setIsValidating(false);
      }
    },
    [binInput, presaleState, eventId, markUnlocked]
  );

  /** Limpia el error de validación cuando el usuario empieza a escribir de nuevo */
  const handleBinChange = useCallback((value) => {
    setBinInput(value.replace(/\D/g, '').slice(0, 16)); // Aceptar hasta 16 dígitos (numero completo)
    setValidationError('');
  }, []);

  return {
    // Estado de preventa
    presaleState,
    needsPresaleGate,
    isUnlocked,

    // Formulario del gate
    binInput,
    handleBinChange,
    validationError,
    isValidating,
    attemptUnlock,

    // BIN confirmado para el checkout (se pasa como card_number al backend)
    confirmedBin,
  };
}
