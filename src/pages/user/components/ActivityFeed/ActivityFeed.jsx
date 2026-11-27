import React from 'react';
import Icon from '../../../../components/Icons/Icons';
import { getImageUrl } from '../../../../utils/imageUtils';
import {
  getTicketEventName,
  getTicketCode,
  formatTicketSeat,
  isTicketCourtesy,
} from '../Wallet/walletUtils';
import styles from '../../UserDashboard.module.css';

export default function ActivityFeed({
  recentTickets = [],
  totalCount = 0,
  onGoToTickets,
  onGoToHistory,
}) {
  if (!recentTickets || recentTickets.length === 0) return null;

  return (
    <section className={styles.sectionBlock} aria-label="Actividad reciente">
      <div className={styles.sectionHeaderRow}>
        <div className={styles.sectionTitleGroup}>
          <p className={styles.sectionEyebrow}>Resumen de cuenta</p>
          <h2 className={styles.sectionHeading}>Actividad reciente</h2>
        </div>

        {totalCount > 3 && (
          <button
            type="button"
            className={styles.sectionLinkBtn}
            onClick={onGoToHistory}
          >
            <span>Ver historial ({totalCount})</span>
            <Icon name="arrowRight" size={14} />
          </button>
        )}
      </div>

      <div className={styles.activityList}>
        {recentTickets.map((ticket, idx) => {
          const rawImg = ticket.event?.image_url || ticket.imageUrl;
          const imgUrl = rawImg ? getImageUrl(rawImg) : null;
          const name = getTicketEventName(ticket);
          const code = getTicketCode(ticket, idx);
          const seat = formatTicketSeat(ticket);
          const courtesy = isTicketCourtesy(ticket);
          const price = parseFloat(ticket.price || 0);

          return (
            <button
              key={ticket.id || idx}
              type="button"
              className={styles.activityItem}
              onClick={onGoToTickets}
            >
              <div className={styles.activityThumb}>
                {imgUrl ? (
                  <img src={imgUrl} alt="" loading="lazy" className={styles.activityThumbImg} />
                ) : (
                  <Icon name="ticket" size={18} />
                )}
              </div>

              <div className={styles.activityContent}>
                <h3 className={styles.activityName}>{name}</h3>
                <div className={styles.activityMeta}>
                  <span className={styles.activityCode}>{code}</span>
                  <span>&bull;</span>
                  <span>{seat}</span>
                </div>
              </div>

              <div className={styles.activityRight}>
                <span className={styles.activityPrice}>
                  {courtesy
                    ? 'Cortesía'
                    : price > 0
                      ? `$${price.toLocaleString('es-MX')}`
                      : 'Gratis'}
                </span>
                <Icon name="chevronRight" size={16} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
