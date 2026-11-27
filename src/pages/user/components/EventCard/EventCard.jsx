import React from 'react';
import Icon from '../../../../components/Icons/Icons';
import { getImageUrl } from '../../../../utils/imageUtils';
import styles from '../../UserDashboard.module.css';

export default function EventCard({ event, onAdd, onView, adding = false }) {
  const rawImg = event?.image_url || event?.image;
  const imgUrl = rawImg ? getImageUrl(rawImg) : null;
  const priceNum = parseFloat(event?.price || 0);
  const priceLabel =
    Number.isFinite(priceNum) && priceNum > 0
      ? `$${priceNum.toLocaleString('es-MX')} MXN`
      : 'Entrada libre';

  const fmtDate = event?.date
    ? new Date(event.date).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const venue = event?.venue_name || event?.venue || null;

  return (
    <article className={styles.eventCard}>
      <div className={styles.eventMedia}>
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={event.name}
            loading="lazy"
            className={styles.eventMediaImg}
          />
        ) : (
          <div className={styles.eventMediaPlaceholder} aria-hidden="true">
            <Icon name="music" size={32} />
          </div>
        )}
        <span className={styles.eventPricePill}>{priceLabel}</span>
      </div>

      <div className={styles.eventBody}>
        <h3 className={styles.eventName} title={event.name}>
          {event.name}
        </h3>

        <div className={styles.eventMetaGroup}>
          {fmtDate && (
            <span className={styles.eventMetaLine}>
              <Icon name="calendar" size={13} />
              <span className={styles.eventMetaText}>{fmtDate}</span>
            </span>
          )}
          {venue && (
            <span className={styles.eventMetaLine}>
              <Icon name="mapPin" size={13} />
              <span className={styles.eventMetaText}>{venue}</span>
            </span>
          )}
        </div>

        <div className={styles.eventActions}>
          <button
            type="button"
            className={`${styles.eventAddBtn} ${adding ? styles.eventAddBtnSuccess : ''}`}
            onClick={onAdd}
            disabled={adding}
          >
            <Icon name={adding ? 'check' : 'shoppingCart'} size={15} />
            <span>{adding ? 'Agregado' : 'Agregar'}</span>
          </button>

          <button
            type="button"
            className={styles.eventViewBtn}
            onClick={onView}
          >
            Ver
          </button>
        </div>
      </div>
    </article>
  );
}
