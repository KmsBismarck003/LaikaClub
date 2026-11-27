import React from 'react';
import Icon from '../../../../components/Icons/Icons';
import { BentoBadge } from '../../../../components/Bento';
import { ACCENTS, getEventImageUrl } from './constants';
import { formatTime } from '../../../EventDetail/utils/helpers';
import {
  getTicketStatus,
  getTicketCode,
  getTicketEventName,
  getTicketVenue,
  getTicketSection,
  getTicketDate,
  formatTicketSeat,
  parseTicketDateParts,
  getEventCountdownLabel,
  getTicketBadgeMeta,
  isTicketCourtesy,
  isTicketCancelled,
  isTicketTransferred,
  isTicketTransferPending,
} from './walletUtils';
import styles from '../../UserWallet.module.css';

export default function WalletTicketCard({
  ticket,
  idx,
  isPast = false,
  isCancelled = false,
  outgoingTransfers = [],
  onOpenTicket,
  onTransfer,
  onCancelTransfer,
  onCancel,
  onNavigateToRefunds,
}) {
  const accent = ACCENTS[idx % ACCENTS.length];
  const status = getTicketStatus(ticket);
  const code = getTicketCode(ticket, idx);
  const name = getTicketEventName(ticket);
  const venue = getTicketVenue(ticket);
  const section = getTicketSection(ticket);
  const seatLabel = formatTicketSeat(ticket);
  const dateRaw = getTicketDate(ticket);
  const timeRaw = ticket?.event?.time || ticket?.time || ticket?.event_time;
  const fmtTime = timeRaw && timeRaw !== 'N/A' ? formatTime(timeRaw) : '';
  const dateParts = parseTicketDateParts(dateRaw);
  const imgUrl = getEventImageUrl(ticket?.event?.image_url || ticket?.imageUrl, idx);

  const isCourtesy = isTicketCourtesy(ticket);
  const isTransferPending = isTicketTransferPending(ticket);
  const isTransferred = isTicketTransferred(ticket);
  const isCancelledTicket = isCancelled || isTicketCancelled(ticket) || isTransferred;

  const badge = getTicketBadgeMeta(ticket, isPast, isCancelledTicket);
  const countdown = !isPast && !isCancelledTicket ? getEventCountdownLabel(dateRaw) : null;

  const canTransfer =
    (status === 'active' || status === 'confirmed') &&
    !isPast &&
    !isCancelledTicket &&
    !isTransferPending &&
    !isCourtesy;

  const canCancel =
    (status === 'active' || status === 'confirmed') &&
    !isPast &&
    !isCancelledTicket &&
    !isTransferPending &&
    !isCourtesy;

  const outTrf = outgoingTransfers.find((ot) => ot.ticket_id === ticket.id);

  const cardClassNames = [
    styles.ticketCard,
    isPast ? styles.ticketCardPast : '',
    isCancelledTicket ? styles.ticketCardCancelled : '',
    isTransferPending ? styles.ticketCardPending : '',
  ]
    .filter(Boolean)
    .join(' ');

  const accentColor = isCancelledTicket
    ? '#ef4444'
    : isTransferPending
      ? '#f59e0b'
      : isPast
        ? 'var(--bento-card-border)'
        : accent.line;

  return (
    <article className={cardClassNames}>
      <div className={styles.cardAccentBar} style={{ background: accentColor }} />

      {/* ── Cabecera visual: Poster + Jerarquía de evento + Calendario ── */}
      <div className={styles.cardMain}>
        <div className={styles.posterWrap}>
          <img
            src={imgUrl}
            alt={name}
            loading="lazy"
            className={`${styles.posterImg} ${isPast || isCancelledTicket ? styles.posterImgMuted : ''}`}
          />
        </div>

        <div className={styles.cardCore}>
          <div className={styles.statusRow}>
            <BentoBadge variant={badge.variant} dot={badge.dot}>
              {badge.label}
            </BentoBadge>
            {countdown && (
              <span className={styles.countdownChip}>
                <Icon name="clock" size={12} />
                <span>{countdown}</span>
              </span>
            )}
          </div>

          <h3 className={styles.eventTitle} title={name}>
            {name}
          </h3>

          <div className={styles.metaList}>
            <span className={styles.metaItem} title={venue}>
              <Icon name="mapPin" size={13} />
              <span className={styles.metaItemText}>{venue}</span>
            </span>
            {fmtTime && (
              <span className={styles.metaItem}>
                <Icon name="clock" size={13} />
                <span>{fmtTime} hrs</span>
              </span>
            )}
          </div>
        </div>

        <div className={styles.dateBlock} aria-label={`Fecha: ${dateParts.full}`}>
          <span className={styles.dateMonth}>{dateParts.month}</span>
          <span className={styles.dateDay}>{dateParts.day}</span>
          {dateParts.year && <span className={styles.dateYear}>{dateParts.year}</span>}
        </div>
      </div>

      {/* ── Franja perforada de metadatos (sin QR miniatura para carga instantánea) ── */}
      <div className={styles.detailsStrip}>
        <div className={styles.detailCell}>
          <span className={styles.detailLabel}>Zona</span>
          <span className={styles.detailValue} title={section}>
            {section}
          </span>
        </div>

        <div className={styles.detailCell}>
          <span className={styles.detailLabel}>Asiento</span>
          <span className={styles.detailValue} title={seatLabel}>
            {seatLabel}
          </span>
        </div>

        <div className={styles.detailCell}>
          <span className={styles.detailLabel}>Código</span>
          <span
            className={`${styles.detailCode} ${isCancelledTicket ? styles.detailCodeRevoked : ''}`}
            title={code}
          >
            {code}
          </span>
        </div>
      </div>

      {/* ── Barra de acciones ergonómicas según estado ── */}
      <div className={styles.cardFooter}>
        {isCancelledTicket ? (
          <>
            <span className={`${styles.footerNote} ${!isTransferred ? styles.footerNoteDanger : ''}`}>
              <Icon name={isTransferred ? 'send' : 'xCircle'} size={14} />
              <span>
                {isTransferred
                  ? 'Acceso cedido a otro usuario'
                  : 'Boleto anulado • Acceso revocado'}
              </span>
            </span>
            {onNavigateToRefunds && !isTransferred && (
              <div className={styles.footerActions}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={onNavigateToRefunds}
                >
                  Ver en Reembolsos
                </button>
              </div>
            )}
          </>
        ) : isTransferPending ? (
          <>
            <span className={`${styles.footerNote} ${styles.footerNoteWarning}`}>
              <Icon name="clock" size={14} />
              <span>
                {outTrf
                  ? `Enviado a ${outTrf.recipient_email}`
                  : 'Transferencia pendiente de aceptación'}
              </span>
            </span>
            {outTrf && onCancelTransfer && (
              <div className={styles.footerActions}>
                <button
                  type="button"
                  className={styles.btnDangerGhost}
                  onClick={() => onCancelTransfer(outTrf.id)}
                >
                  Cancelar Envío
                </button>
              </div>
            )}
          </>
        ) : isPast ? (
          <>
            <span className={styles.footerNote}>
              <Icon name="history" size={14} />
              <span>Evento concluido • Sin QR activo</span>
            </span>
            <div className={styles.footerActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => onOpenTicket && onOpenTicket(ticket, true)}
              >
                <Icon name="eye" size={15} />
                <span>Ver Recuerdo</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {isCourtesy ? (
              <span className={styles.footerNote}>
                <Icon name="crown" size={14} />
                <span>Cortesía oficial • No transferible</span>
              </span>
            ) : (
              <button
                type="button"
                className={styles.btnPrimaryPass}
                onClick={() => onOpenTicket && onOpenTicket(ticket, false)}
              >
                <Icon name="ticket" size={15} />
                <span>Ver Boleto</span>
              </button>
            )}

            <div className={styles.footerActions}>
              {isCourtesy && (
                <button
                  type="button"
                  className={styles.btnPrimaryPass}
                  onClick={() => onOpenTicket && onOpenTicket(ticket, false)}
                >
                  <Icon name="ticket" size={15} />
                  <span>Ver Boleto</span>
                </button>
              )}

              {canTransfer && (
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => onTransfer && onTransfer(ticket)}
                >
                  <Icon name="send" size={14} />
                  <span>Transferir</span>
                </button>
              )}

              {canCancel && (
                <button
                  type="button"
                  className={styles.btnDangerGhost}
                  onClick={() => onCancel && onCancel(ticket)}
                >
                  <span>Cancelar</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </article>
  );
}

