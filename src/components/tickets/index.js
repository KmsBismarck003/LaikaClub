/**
 * @file index.js
 * @description Barrel export del módulo de boletos de LAIKA CLUB.
 * Importa desde aquí en cualquier parte del proyecto.
 *
 * @example
 * import { TicketCard } from '@/components/tickets';
 * import { extractTicketData, formatTicketDate } from '@/components/tickets';
 */

// ── Componentes ──────────────────────────────────────────────
export { default as TicketCard }         from './TicketCard';
export { default as TicketInfoSection }  from './TicketInfoSection';
export { default as TicketQRSection }    from './TicketQRSection';

// ── Utilidades de datos ──────────────────────────────────────
export { extractTicketData, buildPdfFilename } from './ticketHelpers';

// ── Utilidades de formateo ───────────────────────────────────
export {
  formatTicketDate,
  formatTicketPrice,
  resolveTicketStatus,
  buildQRUrl,
  formatZoneLabel,
} from './ticketFormatters';

// Exportación default para compatibilidad con imports legacy
export { default } from './TicketCard';
