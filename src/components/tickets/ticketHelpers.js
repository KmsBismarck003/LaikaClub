/**
 * @module ticketHelpers
 * @description Extractores de datos del modelo de backend para la capa de presentación.
 * Desacopla la estructura de la API del contrato de props del componente.
 *
 * Convención de naming del backend (cualquiera de los siguientes es válido):
 *   snake_case (Python/MongoDB): event_name, ticket_code, event_date
 *   camelCase (JS normalizado):  eventName, ticketCode, eventDate
 */

/**
 * Configuración de imagen fallback para eventos sin imagen registrada.
 * Usar imagen neutra y oscura que no rompa la paleta del boleto.
 */
const FALLBACK_EVENT_IMAGE =
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80&auto=format';

/**
 * Normaliza la URL de la imagen del evento resolviendo la IP/Host del backend.
 */
export const getEventImageUrl = (url) => {
  if (!url) return FALLBACK_EVENT_IMAGE;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const isBrowser = typeof window !== 'undefined';
  const hostname = isBrowser ? window.location.hostname : 'localhost';
  const host = hostname === 'localhost' || hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : `http://${hostname}:8000`;
  
  if (url.startsWith('/')) {
    return `${host}${url}`;
  }
  return `${host}/${url}`;
};

/**
 * Extrae y normaliza todos los datos necesarios del objeto ticket del backend.
 *
 * @param {Object} ticket - Objeto ticket crudo del backend/API
 * @returns {{
 *   eventName: string,
 *   eventSubtitle: string,
 *   location: string,
 *   userName: string,
 *   ticketType: string,
 *   price: number,
 *   ticketCode: string,
 *   eventDate: string|null,
 *   eventImage: string,
 *   status: string,
 *   seatNumber: string|null,
 *   orderNumber: string|null,
 * }}
 */
export const extractTicketData = (ticket = {}) => {
  return {
    // Nombre del evento
    eventName:
      ticket.event?.name ??
      ticket.event_name ??
      ticket.eventName ??
      ticket.name ??
      'EVENTO LAIKA',

    // Subtítulo / categoría del evento
    eventSubtitle:
      ticket.event?.subtitle ??
      ticket.event?.category ??
      ticket.event_subtitle ??
      ticket.eventSubtitle ??
      ticket.category ??
      ticket.event_category ??
      'EVENTO ESPECIAL',

    // Venue / ubicación
    location:
      ticket.event?.venue_name ??
      ticket.event?.venue ??
      ticket.event_location ??
      ticket.location ??
      ticket.venue ??
      ticket.event_venue ??
      'LAIKA CLUB',

    // Nombre del portador
    userName:
      ticket.user_name ??
      ticket.userName ??
      ticket.attendee ??
      ticket.holder_name ??
      'PORTADOR DEL BOLETO',

    // Zona / tipo de acceso (General, VIP, Mesa, etc.)
    ticketType:
      ticket.ticket_type ??
      ticket.ticketType ??
      ticket.zone ??
      ticket.type ??
      'GENERAL',

    // Precio numérico
    price: Number(
      ticket.ticket_price ??
      ticket.price ??
      ticket.cost ??
      0
    ),

    // Código alfanumérico único del boleto
    ticketCode:
      ticket.ticket_code ??
      ticket.ticketCode ??
      ticket.code ??
      ticket.access_code ??
      (ticket._id ? `LK-${ticket._id}` : null) ??
      (ticket.id ? `LK-${ticket.id}` : 'LAIKA-000000'),

    // Fecha ISO del evento
    eventDate:
      ticket.event?.date ??
      ticket.event_date ??
      ticket.eventDate ??
      ticket.date ??
      null,

    // URL de imagen del evento
    eventImage:
      getEventImageUrl(
        ticket.event?.image_url ??
        ticket.event?.imageUrl ??
        ticket.imageUrl ??
        ticket.event_image ??
        ticket.eventImage ??
        ticket.image ??
        ticket.banner
      ),

    // Estado del boleto
    status:
      ticket.ticket_status ??
      ticket.status ??
      'active',

    // Asiento específico (si aplica)
    seatNumber:
      ticket.seat_number ??
      ticket.seatNumber ??
      ticket.seat ??
      null,

    // Número de orden de compra
    orderNumber:
      ticket.order_number ??
      ticket.orderNumber ??
      ticket.order_id ??
      null,
  };
};

/**
 * Genera el PDF filename formateado para descarga.
 * @param {string} ticketCode
 * @param {string} eventName
 * @returns {string}
 */
export const buildPdfFilename = (ticketCode, eventName) => {
  const safeName = (eventName ?? 'evento')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return `boleto-laika-${safeName}-${ticketCode}.pdf`;
};

export default {
  extractTicketData,
  buildPdfFilename,
};
