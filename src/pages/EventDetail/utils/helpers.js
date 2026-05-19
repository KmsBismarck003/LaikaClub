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

// Resuelve el identificador de asiento único (ID o frontend_id) a su nombre legible (ej: E4)
export const getSeatLabel = (seatId, event) => {
  if (!seatId) return "";
  
  // 1. Intentar extraer del nuevo formato del builder v2: layout_json.components
  const components =
    event?.room?.layout_json?.components ||
    event?.seating_map?.layout_json?.components;

  if (components && Array.isArray(components)) {
    for (const comp of components) {
      if (comp.type === 'seats' && Array.isArray(comp.blocks)) {
        for (const block of comp.blocks) {
          if (Array.isArray(block.seats)) {
            const seat = block.seats.find(s => s && s.id === seatId);
            if (seat) {
              const row = seat.rowLabel || seat.row_label || block.rowLabel || block.name || '';
              const num = seat.number !== undefined ? seat.number : (seat.seat_number !== undefined ? seat.seat_number : '');
              return `${row}${num}`;
            }
          }
        }
      }
    }
  }

  // 2. Intentar extraer del formato legacy de zonas si está presente
  const zones = event?.room?.zones || event?.zones;
  if (zones && Array.isArray(zones)) {
    for (const zone of zones) {
      if (Array.isArray(zone.blocks)) {
        for (const block of zone.blocks) {
          if (Array.isArray(block.seats)) {
            const seat = block.seats.find(s => s && (s.id === seatId || s.frontend_id === seatId));
            if (seat) {
              const row = seat.row_label || seat.rowLabel || block.name || '';
              const num = seat.seat_number !== undefined ? seat.seat_number : (seat.number !== undefined ? seat.number : '');
              return `${row}${num}`;
            }
          }
        }
      }
    }
  }

  // 3. Fallback: Parsear formato legacy con guiones (ej: "General-A-4" o "VIP-E-12")
  const parts = String(seatId).split('-');
  return parts.length >= 3
    ? `${parts[parts.length - 2]}${parts[parts.length - 1]}`
    : parts.pop() || seatId;
};
