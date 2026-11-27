import { getSeatLabel } from '../../../EventDetail/utils/helpers';
import { parseLocalDate } from '../../../../utils/date';

const MONTHS_SHORT = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

export function getTicketStatus(ticket) {
  return (ticket?.status || '').toLowerCase();
}

export function isTicketCancelled(ticket) {
  const st = getTicketStatus(ticket);
  return st === 'cancelled' || st === 'refunded';
}

export function isTicketTransferred(ticket) {
  return getTicketStatus(ticket) === 'transferred';
}

export function isTicketTransferPending(ticket) {
  return getTicketStatus(ticket) === 'transfer_pending';
}

export function isTicketCourtesy(ticket) {
  return Boolean(ticket?.is_courtesy || ticket?.isCourtesy);
}

export function getTicketDate(ticket) {
  return ticket?.event?.date || ticket?.date || null;
}

export function isTicketUpcoming(ticket) {
  const dateRaw = getTicketDate(ticket);
  const parsed = dateRaw ? parseLocalDate(dateRaw) : null;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const isFutureOrUndated = !parsed || Number.isNaN(parsed.getTime()) || parsed >= startOfToday;
  return isFutureOrUndated && !isTicketCancelled(ticket) && !isTicketTransferred(ticket);
}

/**
 * Determina si un boleto corresponde a un evento ya concluido o usado,
 * para desactivar la generación y visualización del código QR.
 */
export function isTicketPastEvent(ticket) {
  if (!ticket) return false;
  const st = getTicketStatus(ticket);
  if (st === 'used') return true;
  const dateRaw = getTicketDate(ticket);
  if (!dateRaw) return false;
  const parsed = parseLocalDate(dateRaw);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return !Number.isNaN(parsed.getTime()) && parsed < startOfToday;
}

export function getTicketCode(ticket, idx = 0) {
  return ticket?.ticket_code || ticket?.ticketCode || `TKT-${String(ticket?.id || idx).padStart(6, '0')}`;
}

export function getTicketEventName(ticket) {
  return ticket?.event?.name || ticket?.eventName || 'Evento LAIKA';
}

export function getTicketVenue(ticket) {
  return ticket?.event?.venue_name || ticket?.venue || 'LAIKA ARENA';
}

export function getTicketSection(ticket) {
  return ticket?.section_name || ticket?.sectionName || ticket?.ticket_type || 'General';
}

/**
 * Resuelve un nombre legible para el asiento evitando mostrar IDs internos crudos
 * como "id_1789446482268_qv704".
 */
export function formatTicketSeat(ticket) {
  const explicitLabel = ticket?.seat_label || ticket?.seatLabel;
  if (explicitLabel && !isOpaqueInternalId(explicitLabel)) {
    return explicitLabel;
  }

  if (ticket?.seat_row && ticket?.seat_number) {
    return `${ticket.seat_row}${ticket.seat_number}`;
  }

  const rawSeatId = ticket?.seat_id || ticket?.seatId;
  if (!rawSeatId) return 'General';

  const resolved = getSeatLabel(rawSeatId, ticket?.event);
  if (!resolved || isOpaqueInternalId(resolved)) {
    return 'Asiento Asignado';
  }
  return resolved;
}

function isOpaqueInternalId(value) {
  const str = String(value).trim();
  if (/^id_\d+/i.test(str)) return true;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(str)) return true;
  if (str.length > 14 && str.includes('_')) return true;
  return false;
}

export function parseTicketDateParts(dateRaw) {
  if (!dateRaw) {
    return { day: '—', month: 'TBD', year: '', full: 'Por confirmar' };
  }
  const date = parseLocalDate(dateRaw);
  if (Number.isNaN(date.getTime())) {
    return { day: '—', month: 'TBD', year: '', full: String(dateRaw) };
  }
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: MONTHS_SHORT[date.getMonth()] || 'TBD',
    year: String(date.getFullYear()),
    full: date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }),
  };
}

export function getEventCountdownLabel(dateRaw) {
  if (!dateRaw) return null;
  const target = parseLocalDate(dateRaw);
  if (Number.isNaN(target.getTime())) return null;

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffDays = Math.round((startTarget - startToday) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return null;
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Mañana';
  if (diffDays <= 30) return `En ${diffDays} días`;
  const months = Math.round(diffDays / 30);
  return months === 1 ? 'En 1 mes' : `En ${months} meses`;
}

export function getTicketBadgeMeta(ticket, isPast, isCancelled) {
  const status = getTicketStatus(ticket);
  const isCourtesy = isTicketCourtesy(ticket);
  const isPending = isTicketTransferPending(ticket);
  const isTransferred = isTicketTransferred(ticket);
  const isRevoked = isCancelled || isTicketCancelled(ticket) || isTransferred;

  if (isPending) {
    return { label: 'En transferencia', variant: 'warning', dot: true };
  }
  if (isRevoked) {
    if (status === 'refunded') return { label: 'Reembolsado', variant: 'warning', dot: false };
    if (isTransferred) return { label: 'Cedido', variant: 'neutral', dot: false };
    return { label: 'Cancelado', variant: 'error', dot: false };
  }
  if (isPast || isTicketPastEvent(ticket)) {
    return { label: 'Concluido', variant: 'neutral', dot: false };
  }
  if (isCourtesy) {
    return { label: 'Cortesía VIP', variant: 'info', dot: true };
  }
  if (status === 'active') {
    return { label: 'Activo', variant: 'success', dot: true };
  }
  if (status === 'confirmed') {
    return { label: 'Confirmado', variant: 'info', dot: true };
  }
  return { label: 'Vigente', variant: 'success', dot: true };
}

