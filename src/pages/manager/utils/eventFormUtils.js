/**
 * Utilidades puras y contratos del formulario de creación/edición de eventos.
 * Separado de React para garantizar pruebas unitarias deterministas y cero regresiones.
 */

export const EVENT_CATEGORIES = [
  { id: 'concert',  label: 'Concierto' },
  { id: 'sport',    label: 'Deporte' },
  { id: 'theater',  label: 'Teatro' },
  { id: 'festival', label: 'Festival' },
  { id: 'family',   label: 'Familiar' },
  { id: 'other',    label: 'Otro' },
];

export const INITIAL_EVENT_FORM = {
  name: '',
  description: '',
  category: 'concert',
  event_date: '',
  event_time: '',
  location: '',
  venue: '',
  venue_id: '',
  total_tickets: 100,
  available_tickets: 100,
  price: 0,
  image_url: '',
  duration_minutes: 0,
  gallery_urls: '',
  map_url: '',
  seat_map_url: '',
  room_id: '',
  use_seating_map: false,
  ads_enabled: false,
  max_ads: 5,
  merch_enabled: false,
  metrics_enabled: false,
  presale_enabled: false,
  presale_bank_name: '',
  presale_bins: '',
  presale_start: '',
  presale_end: '',
};

export function formatEventTime(time) {
  if (!time && time !== 0) return '';
  const str = String(time).trim();
  if (str.includes(':')) return str.substring(0, 5);
  if (!Number.isNaN(Number(str)) && str !== '') {
    const totalSec = parseInt(str, 10);
    const h = Math.floor(totalSec / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }
  return '';
}

export function sortFunctionsChronologically(functionsList = []) {
  return [...functionsList].sort((a, b) => {
    const da = `${a?.date || ''}T${formatEventTime(a?.time) || '00:00'}`;
    const db = `${b?.date || ''}T${formatEventTime(b?.time) || '00:00'}`;
    return da.localeCompare(db);
  });
}

export function normalizeEventToForm(event) {
  if (!event) return { ...INITIAL_EVENT_FORM };

  return {
    ...INITIAL_EVENT_FORM,
    name: event.name || '',
    description: event.description || '',
    category: event.category || 'concert',
    event_date: event.event_date ? String(event.event_date).split('T')[0] : '',
    event_time: event.event_time ? formatEventTime(event.event_time) : '',
    location: event.location || '',
    venue: event.venue || '',
    venue_id: event.venue_id ?? '',
    room_id: event.room_id ?? '',
    use_seating_map: Boolean(event.use_seating_map),
    total_tickets: event.total_tickets ?? 100,
    available_tickets: event.available_tickets ?? event.total_tickets ?? 100,
    price: event.price ?? 0,
    image_url: event.image_url || '',
    duration_minutes: event.duration_minutes ?? 0,
    gallery_urls: event.gallery_urls || '',
    map_url: event.map_url || '',
    seat_map_url: event.seat_map_url || '',
    ads_enabled: Boolean(event.ads_enabled),
    max_ads: event.max_ads ?? 5,
    merch_enabled: Boolean(event.merch_enabled),
    metrics_enabled: Boolean(event.metrics_enabled),
    presale_enabled: Boolean(event.presale_enabled),
    presale_bank_name: event.presale_bank_name || '',
    presale_bins: event.presale_bins || '',
    presale_start: event.presale_start || '',
    presale_end: event.presale_end || '',
  };
}

export function normalizeEventFunctions(event) {
  if (!event || !Array.isArray(event.functions)) return [];
  return event.functions.map((f, idx) => ({
    id: f.id,
    tempId: f.id || `fn-${idx}`,
    date: f.date ? String(f.date).split('T')[0] : '',
    time: formatEventTime(f.time),
    venue_id: f.venue_id ?? event.venue_id ?? '',
    room_id: f.room_id ?? '',
  }));
}

/**
 * Resuelve la lista final de funciones, la fecha/hora principal y valida los campos obligatorios.
 * Preserva room_id tanto en auto-agregado como en funciones existentes.
 */
export function resolveAndValidateEventForm({
  formData,
  functions = [],
  newFunction = null,
  rules = [],
  hasAdvancedPackage = false,
  isEditing = false,
}) {
  let finalFunctions = Array.isArray(functions) ? [...functions] : [];
  let finalDate = formData.event_date || '';
  let finalTime = formData.event_time || '';

  // Si el usuario llenó una función en el borrador pero no pulsó "+ Agregar", se incluye automáticamente sin perder room_id
  if (finalFunctions.length === 0 && newFunction?.date) {
    const autoTime = formatEventTime(newFunction.time) || '20:00';
    const autoVenue = newFunction.venue_id || formData.venue_id;
    const autoRoom = newFunction.room_id || formData.room_id || '';

    if (autoVenue) {
      finalFunctions = [
        {
          date: newFunction.date,
          time: autoTime,
          venue_id: autoVenue,
          room_id: autoRoom,
          tempId: Date.now(),
        },
      ];
      finalDate = newFunction.date;
      finalTime = autoTime;
    }
  } else if (finalFunctions.length > 0) {
    const sorted = sortFunctionsChronologically(finalFunctions);
    finalFunctions = sorted;
    finalDate = sorted[0].date;
    finalTime = formatEventTime(sorted[0].time);
  }

  if (!formData.name || !String(formData.name).trim()) {
    return { valid: false, error: 'El nombre del evento es obligatorio.' };
  }
  if (!formData.venue_id && finalFunctions.length === 0) {
    return { valid: false, error: 'Selecciona un recinto principal para el evento.' };
  }
  if (!finalDate) {
    return { valid: false, error: 'Agrega al menos una fecha en la programación del evento.' };
  }
  if (!finalTime) {
    return { valid: false, error: 'Ingresa una hora válida para la función (ej. 20:00).' };
  }

  const parsedPrice = parseFloat(formData.price);
  if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
    return { valid: false, error: 'El precio del boleto no puede ser negativo.' };
  }

  const parsedTotal = parseInt(formData.total_tickets, 10);
  if (Number.isNaN(parsedTotal) || parsedTotal < 1) {
    return { valid: false, error: 'El total de boletos debe ser al menos 1.' };
  }

  const primaryVenueId =
    parseInt(formData.venue_id, 10) ||
    (finalFunctions.length > 0 ? parseInt(finalFunctions[0].venue_id, 10) : 1);

  const primaryRoomId = formData.room_id ? parseInt(formData.room_id, 10) : null;

  // Al editar, preservar available_tickets existente (acotado al nuevo total_tickets) en lugar de resetearlo
  const preservedAvailable = isEditing
    ? Math.min(
        parsedTotal,
        Math.max(0, parseInt(formData.available_tickets ?? parsedTotal, 10))
      )
    : parsedTotal;

  const payload = {
    ...formData,
    name: String(formData.name).trim(),
    event_date: finalDate,
    event_time: finalTime,
    price: parsedPrice || 0,
    total_tickets: parsedTotal,
    available_tickets: preservedAvailable,
    duration_minutes: Math.max(0, parseInt(formData.duration_minutes, 10) || 0),
    venue_id: primaryVenueId,
    room_id: primaryRoomId,
    use_seating_map: hasAdvancedPackage && Boolean(primaryRoomId) ? Boolean(formData.use_seating_map) : false,
    location:
      formData.location && String(formData.location).trim()
        ? String(formData.location).trim()
        : 'Ubicación General',
    functions: finalFunctions.map((f) => ({
      date: f.date,
      time: formatEventTime(f.time),
      venue_id: parseInt(f.venue_id || primaryVenueId, 10),
      room_id: f.room_id ? parseInt(f.room_id, 10) : null,
    })),
    rules: Array.isArray(rules) ? rules : [],
  };

  return { valid: true, error: null, payload };
}

/**
 * Construye el objeto exacto que consume EventCardPremium en la página principal,
 * reflejando en tiempo real las funciones programadas o en edición.
 */
export function buildHomePreviewEvent(formData = {}, functions = [], newFunction = null) {
  const sorted = sortFunctionsChronologically(functions);
  const firstFn = sorted[0] || (newFunction?.date ? newFunction : null);

  const rawDate = firstFn?.date || formData.event_date || '';
  const rawTime = formatEventTime(firstFn?.time || formData.event_time || '');

  // Evita corrimiento de día por UTC al construir Date("YYYY-MM-DD")
  const safeIsoDate = rawDate
    ? `${rawDate}T${rawTime || '12:00'}:00`
    : null;

  const totalTickets = parseInt(formData.total_tickets, 10);

  return {
    id: 'preview',
    name: formData.name?.trim() || 'Nombre de tu evento',
    category: formData.category || 'concert',
    event_date: safeIsoDate,
    date: safeIsoDate,
    start_time: rawTime,
    time: rawTime,
    venue: formData.venue || formData.location || 'Recinto por definir',
    location: formData.location || '',
    image_url: formData.image_url || '',
    price: parseFloat(formData.price) || 0,
    available_seats: Number.isNaN(totalTickets) ? 100 : totalTickets,
  };
}
