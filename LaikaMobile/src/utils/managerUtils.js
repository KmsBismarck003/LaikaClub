/**
 * Utility functions for the LaikaClub Manager console.
 */

/**
 * Formats a number as currency (MXN).
 * @param {number|string} value
 * @returns {string}
 */
export const formatCurrency = (value) => {
  const num = typeof value === 'number' ? value : parseFloat(value || 0);
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(num);
};

/**
 * Formats an ISO or YYYY-MM-DD date string.
 * @param {string} dateString
 * @returns {string}
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/D';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      // Avoid time zone shifts when parsing YYYY-MM-DD local
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('es-MX', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (err) {
    return dateString;
  }
};

/**
 * Formats a HH:MM time string.
 * @param {string} timeString
 * @returns {string}
 */
export const formatTime = (timeString) => {
  if (!timeString) return 'N/D';
  // If in HH:MM:SS format, trim seconds
  const parts = timeString.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]} hrs`;
  }
  return timeString;
};

/**
 * Maps event status code to standard Spanish label.
 * @param {string} status
 * @returns {string}
 */
export const getStatusLabel = (status) => {
  const mapping = {
    published: 'Público',
    draft: 'Borrador',
    cancelled: 'Cancelado',
    completed: 'Terminado',
  };
  return mapping[status] || status || 'Borrador';
};

/**
 * Maps event status to a visual variant badge name.
 * @param {string} status
 * @returns {'success' | 'warning' | 'error' | 'secondary'}
 */
export const getStatusVariant = (status) => {
  const mapping = {
    published: 'success',
    draft: 'warning',
    cancelled: 'error',
    completed: 'secondary',
  };
  return mapping[status] || 'secondary';
};

export default {
  formatCurrency,
  formatDate,
  formatTime,
  getStatusLabel,
  getStatusVariant,
};
