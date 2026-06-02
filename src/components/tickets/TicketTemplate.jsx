/**
 * @deprecated Usa TicketCard en su lugar.
 * Este archivo es un shim de compatibilidad para no romper imports existentes.
 * El componente real vive en ./TicketCard.jsx
 *
 * @example
 * // Antes (sigue funcionando sin cambios):
 * import TicketTemplate from '@/components/tickets/TicketTemplate'
 *
 * // Recomendado (nuevo):
 * import { TicketCard } from '@/components/tickets'
 */
export { default } from './TicketCard';
