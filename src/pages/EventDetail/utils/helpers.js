// Obtiene la imagen de portada del primer color de un producto
export const getMerchCardImage = (item, colorIdx = 0) => item.colors[colorIdx]?.images[0] || '';

// Limpia el precio eliminando símbolos y comas para cálculos seguros (Evita NaN)
export const cleanPrice = (price) => {
  if (typeof price === "number") return price;
  if (!price) return 0;
  const cleaned = String(price).replace(/[^0-9.-]+/g, "");
  return parseFloat(cleaned) || 0;
};

// Formatea fecha: 2024-05-10 -> 10 MAY 2024 o 18/05/2026 -> 18 MAY 2026
export const formatDate = (dateStr) => {
  if (!dateStr) return "TBD";
  try {
    let date;
    // Check if it's in DD/MM/YYYY or DD-MM-YYYY format
    const ddMmYyyyMatch = String(dateStr).trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (ddMmYyyyMatch) {
      const [, day, month, year] = ddMmYyyyMatch;
      // month is 0-indexed in JS Date constructor (0 = January)
      date = new Date(Number(year), Number(month) - 1, Number(day));
    } else {
      date = new Date(dateStr);
    }

    if (isNaN(date.getTime())) {
      return dateStr;
    }

    return date.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
  } catch (e) {
    return dateStr;
  }
};

// Formatea hora: 20:00:00 -> 20:00, o 67320 (segundos desde medianoche) -> 18:42
export const formatTime = (timeStr) => {
  if (timeStr === null || timeStr === undefined) return "";
  
  const strVal = String(timeStr).trim();
  // If it's a number or string containing only digits (seconds since midnight)
  if (/^\d+$/.test(strVal)) {
    const seconds = Number(strVal);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  // If the string contains only letters or spaces (like "horas" or "TBD"), return empty string
  if (/^[a-zA-Z\s]+$/.test(strVal)) return "";

  // Standard time format
  return strVal.substring(0, 5);
};
