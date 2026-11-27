import React from 'react';
import Icon from '../../../../components/Icons/Icons';
import { BentoBadge } from '../../../../components/Bento';
import { getImageUrl } from '../../../../utils/imageUtils';
import { REFUND_STATUS_META, getRefundAmount } from '../../hooks/useRefundTracker';
import styles from '../../RefundTracker.module.css';

const FILTER_OPTIONS = [
  { id: 'all', label: 'Todas' },
  { id: 'pending', label: 'En proceso' },
  { id: 'refunded', label: 'Reembolsadas' },
  { id: 'rejected', label: 'Rechazadas' },
];

export default function RefundHistoryList({
  requests,
  totalCount,
  statusFilter,
  countsByFilter,
  hasEligibleTickets,
  onSelectFilter,
  onOpenNewRequest,
}) {
  return (
    <section className={styles.surfaceCard} aria-label="Historial de solicitudes">
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderText}>
          <h2 className={styles.cardTitle}>Historial de solicitudes</h2>
          <p className={styles.cardSubtitle}>
            Seguimiento actualizado de cada devolución registrada en tu cuenta.
          </p>
        </div>

        {totalCount > 1 && (
          <div className={styles.filterRow} role="tablist" aria-label="Filtrar solicitudes">
            {FILTER_OPTIONS.map((opt) => {
              const count = countsByFilter[opt.id] || 0;
              if (opt.id !== 'all' && count === 0) return null;
              const isActive = statusFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`${styles.filterPill} ${isActive ? styles.filterPillActive : ''}`}
                  onClick={() => onSelectFilter(opt.id)}
                >
                  <span>{opt.label}</span>
                  <span>({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {requests.length === 0 ? (
        <div className={styles.emptyBox}>
          <span className={styles.emptyIcon}>
            <Icon name="inbox" size={24} />
          </span>
          <h3 className={styles.emptyTitle}>
            {totalCount === 0
              ? 'Sin solicitudes registradas'
              : 'Sin solicitudes en esta categoría'}
          </h3>
          <p className={styles.emptyText}>
            {totalCount === 0
              ? 'Cuando solicites la cancelación de un boleto activo, podrás seguir su progreso aquí.'
              : 'Prueba cambiando el filtro para ver el resto de tu historial.'}
          </p>
          {totalCount === 0 && hasEligibleTickets && (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={onOpenNewRequest}
            >
              <Icon name="plus" size={15} />
              <span>Solicitar reembolso</span>
            </button>
          )}
        </div>
      ) : (
        <div className={styles.requestsList}>
          {requests.map((req, idx) => {
            const rawStatus = (req.status || 'pending').toLowerCase();
            const statusMeta = REFUND_STATUS_META[rawStatus] || REFUND_STATUS_META.pending;
            const ticket = req.ticket;
            const name = req.eventName || ticket?.event?.name || ticket?.eventName || 'Evento LAIKA';
            const rawImg = ticket?.event?.image_url || ticket?.imageUrl;
            const imgUrl = rawImg ? getImageUrl(rawImg) : null;
            const amount = getRefundAmount(req);
            const createdRaw = req.created_at || req.createdAt;
            const created = createdRaw
              ? new Date(createdRaw).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : '—';
            const code =
              req.ticketCode ||
              req.ticket_code ||
              ticket?.ticket_code ||
              `TKT-${req.ticket_id || req.ticketId || idx}`;

            return (
              <article key={req.id || idx} className={styles.requestRow}>
                <div className={styles.requestThumb}>
                  {imgUrl ? (
                    <img src={imgUrl} alt="" loading="lazy" className={styles.requestThumbImg} />
                  ) : (
                    <Icon name="ticket" size={20} />
                  )}
                </div>

                <div className={styles.requestCore}>
                  <div className={styles.requestTitleLine}>
                    <h3 className={styles.requestEventName}>{name}</h3>
                    <span className={styles.ticketCodeChip}>{code}</span>
                  </div>

                  <div className={styles.requestMetaRow}>
                    <span className={styles.requestMetaItem}>
                      <Icon name="calendar" size={12} />
                      <span>Solicitado: {created}</span>
                    </span>
                    {req.reason && (
                      <span className={styles.requestReason} title={req.reason}>
                        {req.reason}
                      </span>
                    )}
                    {req.paymentMethod && (
                      <span className={styles.requestMetaItem}>
                        <Icon name="creditCard" size={12} />
                        <span>{req.paymentMethod}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.requestRight}>
                  {amount > 0 && (
                    <span className={styles.requestAmount}>
                      ${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                  <BentoBadge variant={statusMeta.variant} dot={statusMeta.dot}>
                    {statusMeta.label}
                  </BentoBadge>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

