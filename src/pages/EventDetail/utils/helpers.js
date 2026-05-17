// Obtiene la imagen de portada del primer color de un producto
export const getMerchCardImage = (item, colorIdx = 0) => item.colors[colorIdx]?.images[0] || '';

// Limpia el precio eliminando símbolos y comas para cálculos seguros (Evita NaN)
export const cleanPrice = (price) => {
  if (typeof price === "number") return price;
  if (!price) return 0;
  const cleaned = String(price).replace(/[^0-9.-]+/g, "");
  return parseFloat(cleaned) || 0;
};

// Formatea fecha: 2024-05-10 -> 10 MAY 2024
export const formatDate = (dateStr) => {
  if (!dateStr) return "TBD";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
  } catch (e) {
    return dateStr;
  }
};

// Formatea hora: 20:00:00 -> 20:00
export const formatTime = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return "";
  return timeStr.substring(0, 5);
};
