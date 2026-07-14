import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PresaleBadge } from '../../../../features/presale';
import './EventHeroV2.css';

/* ── Inline SVGs to avoid icon registry dependency ── */
const IconBack = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconCalendar = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconClock = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconMapPin = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" />
  </svg>
);
const IconShare = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
const IconLock = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const CATEGORY_LABELS = {
  concert: 'Concierto',
  sport: 'Deporte',
  theater: 'Teatro',
  festival: 'Festival',
  family: 'Familiar',
  other: 'Evento',
};

/**
 * EventHeroV2 — Full-bleed cinematic event hero.
 * Replaces the old EventHero component.
 * Props are identical to EventHero so the parent (EventDetail.jsx) needs no logic changes,
 * only the import name changes.
 */
const EventHeroV2 = ({
  heroRef,
  imageUrl,
  event,
  isVideo,
  tiktokId,
  videoRef,
  formatDate,
  displayDate,
  formatTime,
  displayTime,
  displayVenue,
  displayCity,
  navigate: navigateProp,
  /* new optional props */
  isLockActive,
  formatTimeLeft,
  presale,
}) => {
  const navigateFallback = useNavigate();
  const navigate = navigateProp || navigateFallback;

  const category = CATEGORY_LABELS[event?.category] || 'Evento';
  const dateStr  = formatDate ? formatDate(displayDate) : '';
  const timeStr  = formatTime ? formatTime(displayTime) : '';
  const location = [displayVenue, displayCity && displayCity !== displayVenue ? displayCity : null]
    .filter(Boolean).join(', ');

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: event?.name, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (_) { /* ignore */ }
  };

  return (
    <section ref={heroRef} className="event-hero-v2" aria-label={`Evento: ${event?.name}`}>

      {/* ── Media ── */}
      {imageUrl && (
        isVideo ? (
          tiktokId ? (
            <iframe
              src={`https://www.tiktok.com/embed/${tiktokId}`}
              className="event-hero-v2__media"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={event?.name}
            />
          ) : (
            <video
              ref={videoRef}
              src={imageUrl}
              autoPlay loop muted playsInline
              className="event-hero-v2__media"
            />
          )
        ) : (
          <img
            src={imageUrl}
            alt={event?.name}
            className="event-hero-v2__media"
            loading="eager"
            draggable="false"
          />
        )
      )}

      {/* ── Overlays ── */}
      <div className="event-hero-v2__top-vignette" aria-hidden="true" />
      <div className="event-hero-v2__overlay" aria-hidden="true" />

      {/* ── Back button ── */}
      <button
        className="event-hero-v2__back"
        onClick={() => navigate(-1)}
        type="button"
        aria-label="Regresar"
      >
        <IconBack />
        Regresar
      </button>

      {/* ── Presale badge slot ── */}
      {presale && (
        <div className="event-hero-v2__presale-slot">
          <PresaleBadge presaleState={presale.presaleState} />
        </div>
      )}

      {/* ── Seat lock banner ── */}
      {isLockActive && formatTimeLeft && (
        <div className="event-hero-v2__lock-banner" role="status">
          <IconLock />
          <span>Reserva temporal activa</span>
          <span className="event-hero-v2__lock-timer">{formatTimeLeft()}</span>
        </div>
      )}

      {/* ── Bottom content ── */}
      <div className="event-hero-v2__content">
        {/* Eyebrow */}
        <div className="event-hero-v2__eyebrow">
          <span className="event-hero-v2__eyebrow-dot" aria-hidden="true" />
          {category}
        </div>

        {/* Title */}
        <h1 className="event-hero-v2__title">{event?.name}</h1>

        {/* Meta row */}
        <div className="event-hero-v2__meta">
          {dateStr && (
            <span className="event-hero-v2__meta-item">
              <IconCalendar />
              {dateStr}
            </span>
          )}
          {timeStr && (
            <span className="event-hero-v2__meta-item">
              <IconClock />
              {timeStr} hrs
            </span>
          )}
          {location && (
            <span className="event-hero-v2__meta-item">
              <IconMapPin />
              {location}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="event-hero-v2__actions">
          <button
            className="event-hero-v2__share-btn"
            onClick={handleShare}
            type="button"
            aria-label="Compartir evento"
            title="Compartir"
          >
            <IconShare />
          </button>
        </div>
      </div>

      {/* ── Scroll hint (desktop only) ── */}
      <div className="event-hero-v2__scroll-hint" aria-hidden="true">
        <div className="event-hero-v2__scroll-line" />
        <span className="event-hero-v2__scroll-label">Scroll</span>
      </div>
    </section>
  );
};

export default EventHeroV2;
