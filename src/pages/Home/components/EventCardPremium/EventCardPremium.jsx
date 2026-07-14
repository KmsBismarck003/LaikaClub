import React, { useCallback } from 'react';
import { getImageUrl } from '../../../../utils/imageUtils';
import { formatDate, formatTime } from '../../hooks/useHomeEvents';
import './EventCardPremium.css';

const CATEGORY_LABELS = {
  concert:  'Concierto',
  sport:    'Deporte',
  theater:  'Teatro',
  festival: 'Festival',
  family:   'Familiar',
  other:    'Evento',
};

const LOW_STOCK_THRESHOLD = 20;

const EventCardPremium = ({ event, onClick }) => {
  const category  = CATEGORY_LABELS[event?.category] || 'Evento';
  const date      = formatDate(event?.event_date || event?.date);
  const time      = formatTime(event?.start_time  || event?.time);
  const location  = event?.venue || event?.location;
  const imageUrl  = getImageUrl(event?.image_url  || event?.image);
  const isLowStock = event?.available_seats > 0 && event?.available_seats <= LOW_STOCK_THRESHOLD;
  const isSoldOut  = event?.available_seats === 0;

  const handleClick = useCallback(() => onClick?.(event), [event, onClick]);

  const handleKeyDown = useCallback(e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(event);
    }
  }, [event, onClick]);

  return (
    <article
      className="ecp"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Ver evento: ${event?.name}`}
    >
      {/* ── IMAGE ── */}
      <div className="ecp__image-wrapper">
        <img
          className="ecp__image"
          src={imageUrl}
          alt={event?.name}
          loading="lazy"
          draggable="false"
        />

        {/* Category badge */}
        <span className={`ecp__category ecp__category--${event?.category || 'other'}`}>
          {category}
        </span>

        {/* Stock badge */}
        {isSoldOut && (
          <span className="ecp__stock ecp__stock--out">Agotado</span>
        )}
        {isLowStock && !isSoldOut && (
          <span className="ecp__stock ecp__stock--low">Pocos lugares</span>
        )}

        {/* Hover action overlay */}
        <div className="ecp__hover-cta" aria-hidden="true">
          <span className="ecp__hover-label">Ver detalles</span>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>

      {/* ── INFO ── */}
      <div className="ecp__body">
        {/* Date block */}
        {date && (
          <div className="ecp__date-block" aria-label={`Fecha: ${date}`}>
            <span className="ecp__date-month">
              {new Date(event?.event_date || event?.date).toLocaleDateString('es-MX', { month: 'short' }).toUpperCase()}
            </span>
            <span className="ecp__date-day">
              {new Date(event?.event_date || event?.date).getDate()}
            </span>
          </div>
        )}

        {/* Text content */}
        <div className="ecp__text">
          {location && (
            <p className="ecp__location">
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              {location}
            </p>
          )}

          <h3 className="ecp__title">{event?.name}</h3>

          {time && (
            <p className="ecp__time">{time} hrs</p>
          )}
        </div>
      </div>

      {/* ── CTA ROW ── */}
      <div className="ecp__footer">
        <span className="ecp__cta-text">Ver boletos</span>
        <span className="ecp__cta-arrow">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </span>
      </div>
    </article>
  );
};

export default EventCardPremium;
