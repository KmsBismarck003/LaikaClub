export const formatCurrency = (val) => {
  const num = parseFloat(val);
  if (isNaN(num)) return '$0.00';
  return `$${num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('es-MX', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  } catch (error) {
    return dateString;
  }
};

export const formatFullDate = (dateString) => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    return dateString;
  }
};

export const formatTime = (time) => {
  if (!time) return '';
  const s = String(time);
  return s.includes(':') ? s.substring(0, 5) : s;
};

export default {
  formatCurrency,
  formatDate,
  formatFullDate,
  formatTime,
};
