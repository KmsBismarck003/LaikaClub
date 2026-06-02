/**
 * @module ticketFormatters
 * @description Utilidades de formateo puro para la capa de presentación del boleto.
 * No contiene lógica de extracción de datos ni side effects.
 */

/**
 * Formatea un string de fecha ISO a la representación editorial del boleto.
 * Formato: "14 DE NOVIEMBRE · 21:00 HRS"
 *
 * @param {string|Date} dateString - Fecha ISO 8601 o Date object
 * @returns {{ day: string, month: string, time: string, full: string } | null}
 */
export const formatTicketDate = (dateString) => {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;

    const day = date.getDate();
    const month = date
      .toLocaleDateString('es-MX', { month: 'long' })
      .toUpperCase();
    const time = date
      .toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      .toUpperCase();

    return {
      day: String(day).padStart(2, '0'),
      month,
      time: `${time} HRS`,
      full: `${day} DE ${month} · ${time} HRS`,
    };
  } catch {
    return null;
  }
};

/**
 * Formatea un valor numérico como moneda MXN.
 * Ejemplo: 1500 → "$1,500 MXN"
 *
 * @param {number|string} amount
 * @returns {string}
 */
export const formatTicketPrice = (amount) => {
  const num = Number(amount);
  if (isNaN(num) || num === 0) return 'ACCESO INCLUIDO';

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num) + ' MXN';
};

/**
 * Devuelve la configuración visual (label + clase CSS) para el estado del boleto.
 *
 * @param {string} status - Estado raw del backend (active, used, expired, etc.)
 * @returns {{ label: string, cssClass: string, isValid: boolean }}
 */
export const resolveTicketStatus = (status = '') => {
  const normalized = status.toLowerCase().trim();

  const statusMap = {
    active: { label: 'VÁLIDO', cssClass: 'status--active', isValid: true },
    activo: { label: 'VÁLIDO', cssClass: 'status--active', isValid: true },
    valid: { label: 'VÁLIDO', cssClass: 'status--active', isValid: true },
    válido: { label: 'VÁLIDO', cssClass: 'status--active', isValid: true },
    used: { label: 'UTILIZADO', cssClass: 'status--used', isValid: false },
    usado: { label: 'UTILIZADO', cssClass: 'status--used', isValid: false },
    expired: { label: 'EXPIRADO', cssClass: 'status--expired', isValid: false },
    expirado: { label: 'EXPIRADO', cssClass: 'status--expired', isValid: false },
    cancelled: { label: 'CANCELADO', cssClass: 'status--cancelled', isValid: false },
    cancelado: { label: 'CANCELADO', cssClass: 'status--cancelled', isValid: false },
  };

  return statusMap[normalized] ?? { label: 'PENDIENTE', cssClass: 'status--pending', isValid: false };
};

/**
 * Genera la URL del QR para el código de acceso dado.
 * Utiliza la API pública de qrserver con parámetros de calidad de impresión.
 *
 * @param {string} code - Código alfanumérico del boleto
 * @param {number} size - Tamaño en píxeles del QR (default: 220)
 * @returns {string} URL completa del QR
 */
export const buildQRUrl = (code, size = 220) => {
  if (!code) return '';
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(code)}&margin=4&ecc=H&color=0-0-0&bgcolor=255-255-255`;
};

/**
 * Normaliza el nombre de zona/tipo de boleto para presentación editorial.
 * Ej: "vip_mesa" → "VIP · MESA"
 *
 * @param {string} ticketType
 * @returns {string}
 */
export const formatZoneLabel = (ticketType = '') => {
  return ticketType
    .replace(/[_-]/g, ' · ')
    .toUpperCase()
    .trim() || 'GENERAL';
};

export default {
  formatTicketDate,
  formatTicketPrice,
  resolveTicketStatus,
  buildQRUrl,
  formatZoneLabel,
};
