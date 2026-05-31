/**
 * binValidator.js — Lógica pura de validación de BIN en el cliente.
 *
 * No tiene efectos secundarios ni dependencias de React.
 * Misma lógica que presale.py en el backend (doble validación por seguridad).
 */

/**
 * Extrae y valida el BIN de los primeros 6 dígitos de un número de tarjeta.
 *
 * @param {string} cardNumber - Número de tarjeta (puede tener espacios).
 * @param {string} allowedBinsCsv - BINs permitidos separados por coma.
 * @returns {boolean}
 */
export function isBinAllowed(cardNumber, allowedBinsCsv) {
  if (!cardNumber || !allowedBinsCsv) return false;

  const cleanNumber = cardNumber.replace(/\D/g, '');
  if (cleanNumber.length < 6) return false;

  const userBin = cleanNumber.slice(0, 6);
  const allowedBins = allowedBinsCsv
    .split(',')
    .map((b) => b.trim())
    .filter(Boolean);

  return allowedBins.includes(userBin);
}

/**
 * Determina si la preventa está actualmente activa en el cliente,
 * basado en las fechas del evento. Misma lógica que el backend.
 *
 * @param {Object} event - Objeto del evento con campos de preventa.
 * @returns {boolean}
 */
export function isPresaleActiveNow(event) {
  if (!event?.presale_enabled) return false;

  const { presale_start, presale_end } = event;
  if (!presale_start || !presale_end) return false;

  try {
    const now = new Date();
    const start = new Date(presale_start);
    const end = new Date(presale_end);
    return now >= start && now <= end;
  } catch {
    return false;
  }
}

/**
 * Construye un objeto de estado de preventa listo para el UI.
 *
 * @param {Object} event
 * @returns {{ isActive: boolean, bankName: string|null, bins: string|null, start: Date|null, end: Date|null }}
 */
export function getPresaleState(event) {
  const isActive = isPresaleActiveNow(event);
  return {
    isActive,
    bankName: event?.presale_bank_name || null,
    bins: event?.presale_bins || null,
    start: event?.presale_start ? new Date(event.presale_start) : null,
    end: event?.presale_end ? new Date(event.presale_end) : null,
  };
}
