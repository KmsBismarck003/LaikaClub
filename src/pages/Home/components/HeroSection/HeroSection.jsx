import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../../../utils/imageUtils';
import { formatDate, formatTime } from '../../hooks/useHomeEvents';
import './HeroSection.css';

const AUTOPLAY_INTERVAL = 5000;

const CATEGORIES_MAP = {
  concert:  'Concierto',
  sport:    'Deporte',
  theater:  'Teatro',
  festival: 'Festival',
  family:   'Familiar',
  other:    'Evento',
};

/* ─── A single hero slide ─── */
const HeroSlide = ({ event, isActive }) => {
  const navigate = useNavigate();
  const category = CATEGORIES_MAP[event?.category] || 'Evento';
  const date = formatDate(event?.event_date || event?.date);
  const time = formatTime(event?.start_time || event?.time);

  return (
    <div className={`hero-slide${isActive ? ' hero-slide--active' : ''}`} aria-hidden={!isActive}>
      <img
        className="hero-bg"
        src={getImageUrl(event?.image_url || event?.image)}
        alt={event?.name || ''}
        loading="eager"
        draggable="false"
      />
      <div className="hero-overlay" />

      <div className="hero-content">
        <span className="hero-eyebrow">
          <span className="hero-eyebrow-dot" />
          {category}
        </span>

        <h1 className="hero-title">{event?.name}</h1>

        <div className="hero-meta">
          {date && (
            <span className="hero-meta-item">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {date}{time ? ` · ${time} hrs` : ''}
            </span>
          )}
          {(event?.venue || event?.location) && (
            <span className="hero-meta-item">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" />
              </svg>
              {event?.venue || event?.location}
            </span>
          )}
        </div>

        <div className="hero-actions">
          <button
            className="hero-btn-primary"
            onClick={() => navigate(`/event/${event?.id}`)}
            type="button"
          >
            Ver evento
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          <button
            className="hero-btn-secondary"
            onClick={() => navigate('/events')}
            type="button"
          >
            Explorar todos
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Static fallback when no events ─── */
const HeroFallback = () => (
  <div className="hero-slide hero-slide--active">
    <img
      className="hero-bg"
      src="/117.png"
      alt="Laika Club"
      loading="eager"
      draggable="false"
    />
    <div className="hero-overlay" />
    <div className="hero-content">
      <span className="hero-eyebrow"><span className="hero-eyebrow-dot" />Bienvenido</span>
      <h1 className="hero-title">Descubre experiencias que no olvidarás</h1>
      <div className="hero-actions">
        <button className="hero-btn-primary" onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })} type="button">
          Ver eventos
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  </div>
);

/* ─── Main HeroSection ─── */
const HeroSection = ({ featuredEvents = [] }) => {
  const [current, setCurrent] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const timerRef = useRef(null);
  const slides = featuredEvents.length > 0 ? featuredEvents.slice(0, 5) : null;
  const count = slides ? slides.length : 0;

  const goTo = useCallback(idx => {
    setCurrent(idx);
    setProgressKey(k => k + 1);
  }, []);

  const next = useCallback(() => goTo(c => (c + 1) % count), [count, goTo]);
  const prev = useCallback(() => goTo(c => (c - 1 + count) % count), [count, goTo]);

  /* Auto-play */
  useEffect(() => {
    if (count <= 1) return;
    timerRef.current = setInterval(() => setCurrent(c => {
      const n = (c + 1) % count;
      setProgressKey(k => k + 1);
      return n;
    }), AUTOPLAY_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [count]);

  /* Keyboard */
  useEffect(() => {
    const handler = e => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next]);

  return (
    <section className="hero-section" aria-label="Eventos destacados">
      <div
        className="hero-track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides
          ? slides.map((event, i) => (
              <HeroSlide key={event.id} event={event} isActive={i === current} />
            ))
          : <HeroFallback />
        }
      </div>

      {/* Progress bar */}
      {count > 1 && (
        <div key={progressKey} className="hero-progress" />
      )}

      {/* Slide counter */}
      {count > 1 && (
        <div className="hero-counter" aria-live="polite">
          {String(current + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </div>
      )}

      {/* Arrows */}
      {count > 1 && (
        <>
          <button className="hero-arrow hero-arrow--left" onClick={prev} aria-label="Evento anterior">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button className="hero-arrow hero-arrow--right" onClick={next} aria-label="Evento siguiente">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {count > 1 && (
        <div className="hero-dots" role="tablist" aria-label="Diapositivas">
          {slides.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Ir a evento ${i + 1}`}
              className={`hero-dot${i === current ? ' hero-dot--active' : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
