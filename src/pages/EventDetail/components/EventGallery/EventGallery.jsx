import React, { useState, useCallback, useRef, useEffect } from 'react';
import './EventGallery.css';

/* ── Inline SVG Icons (sin dependencia de icon registry) ── */
const IconChevronLeft = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const IconChevronRight = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const IconPlay = () => (
  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

/**
 * Normaliza galleryUrls (string CSV o array) a un array de strings.
 * Función pura fuera del componente para no violar las reglas de hooks.
 */
function normalizeUrls(galleryUrls) {
  if (typeof galleryUrls === 'string') {
    return galleryUrls.split(',').map((u) => u.trim()).filter(Boolean);
  }
  if (Array.isArray(galleryUrls)) {
    return galleryUrls.filter(Boolean);
  }
  return [];
}

const isVideo = (url) => url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');

/**
 * EventGallery — Carrusel de galería de fotos/videos del evento.
 * Diseño: dark glassmorphism premium, transiciones suaves, swipe en móvil,
 * thumbnails con glow activo, contador de posición y navegación con teclado.
 *
 * @param {string|string[]} galleryUrls — URLs separadas por coma o array
 */
export default function EventGallery({ galleryUrls }) {
  // ── Todos los hooks PRIMERO, antes de cualquier return condicional ──
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDir, setTransitionDir] = useState('next'); // 'next' | 'prev'
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const containerRef = useRef(null);

  // Normalización fuera de hooks
  const urls = normalizeUrls(galleryUrls);
  const total = urls.length;

  /* ── Navegación ── */
  const goTo = useCallback((nextIndex, direction = 'next') => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTransitionDir(direction);
    setTimeout(() => {
      setActiveIndex(nextIndex);
      setIsTransitioning(false);
    }, 280);
  }, [isTransitioning]);

  const goPrev = useCallback(() => {
    const prev = (activeIndex - 1 + total) % total;
    goTo(prev, 'prev');
  }, [activeIndex, total, goTo]);

  const goNext = useCallback(() => {
    const next = (activeIndex + 1) % total;
    goTo(next, 'next');
  }, [activeIndex, total, goTo]);

  /* ── Teclado ── */
  useEffect(() => {
    if (total === 0) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goPrev, goNext, total]);

  /* ── Early return DESPUÉS de todos los hooks ── */
  if (total === 0) return null;

  /* ── Touch / Swipe ── */
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Solo procesar si el swipe es más horizontal que vertical
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      dx < 0 ? goNext() : goPrev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const currentUrl = urls[activeIndex];

  return (
    <div className="eg-container" ref={containerRef} aria-label="Galería del evento">

      {/* ── Header ── */}
      <div className="eg-header">
        <h3 className="eg-title">
          <span className="eg-title-dot" aria-hidden="true" />
          Galería del Evento
        </h3>
        {total > 1 && (
          <span className="eg-counter" aria-label={`Imagen ${activeIndex + 1} de ${total}`}>
            {String(activeIndex + 1).padStart(2, '0')}
            <span className="eg-counter-sep">/</span>
            {String(total).padStart(2, '0')}
          </span>
        )}
      </div>

      {/* ── Visor principal ── */}
      <div
        className="eg-main-viewport"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-live="polite"
      >
        {/* Media */}
        <div className={`eg-media-wrapper ${isTransitioning ? `eg-transitioning eg-dir-${transitionDir}` : ''}`}>
          {isVideo(currentUrl) ? (
            <video
              key={currentUrl}
              src={currentUrl}
              className="eg-media"
              controls
              autoPlay
              loop
              muted
              playsInline
              aria-label={`Video del evento ${activeIndex + 1}`}
            />
          ) : (
            <img
              key={currentUrl}
              src={currentUrl}
              alt={`Galería del evento, imagen ${activeIndex + 1} de ${total}`}
              className="eg-media"
              draggable="false"
              loading={activeIndex === 0 ? 'eager' : 'lazy'}
            />
          )}

          {/* Overlay gradiente para depth */}
          <div className="eg-media-vignette" aria-hidden="true" />

          {/* Badge de video */}
          {isVideo(currentUrl) && (
            <div className="eg-video-badge" aria-hidden="true">
              <IconPlay />
              Video
            </div>
          )}
        </div>

        {/* ── Botones de navegación ── */}
        {total > 1 && (
          <>
            <button
              className="eg-nav-btn eg-nav-prev"
              onClick={goPrev}
              aria-label="Imagen anterior"
              type="button"
            >
              <IconChevronLeft />
            </button>
            <button
              className="eg-nav-btn eg-nav-next"
              onClick={goNext}
              aria-label="Imagen siguiente"
              type="button"
            >
              <IconChevronRight />
            </button>
          </>
        )}

        {/* ── Dots de posición (para galerías pequeñas) ── */}
        {total > 1 && total <= 8 && (
          <div className="eg-dots" role="tablist" aria-label="Posición en galería">
            {urls.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Ir a imagen ${i + 1}`}
                className={`eg-dot ${i === activeIndex ? 'active' : ''}`}
                onClick={() => goTo(i, i > activeIndex ? 'next' : 'prev')}
                type="button"
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Thumbnails ── */}
      {total > 1 && (
        <div className="eg-thumbnails" role="list">
          {urls.map((url, idx) => (
            <button
              key={idx}
              role="listitem"
              type="button"
              aria-label={`Ver imagen ${idx + 1}`}
              aria-current={idx === activeIndex ? 'true' : undefined}
              className={`eg-thumb ${idx === activeIndex ? 'active' : ''}`}
              onClick={() => goTo(idx, idx > activeIndex ? 'next' : 'prev')}
            >
              {isVideo(url) ? (
                <div className="eg-thumb-video-wrapper">
                  <video src={url} className="eg-thumb-media" muted playsInline tabIndex={-1} />
                  <div className="eg-thumb-play-overlay" aria-hidden="true">
                    <IconPlay />
                  </div>
                </div>
              ) : (
                <img src={url} alt={`Miniatura ${idx + 1}`} className="eg-thumb-media" loading="lazy" />
              )}
              {/* Glow ring activo */}
              <div className="eg-thumb-ring" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
