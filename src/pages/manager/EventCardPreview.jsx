import React, { useMemo } from 'react';
import { Badge } from '../../components';
import EventCardPremium from '../Home/components/EventCardPremium/EventCardPremium';
import { buildHomePreviewEvent } from './utils/eventFormUtils';
import styles from './EventForm.module.css';

const EDITORIAL_POSTER_FALLBACK =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#18181b"/>
          <stop offset="100%" stop-color="#27272a"/>
        </linearGradient>
      </defs>
      <rect width="640" height="400" fill="url(#bg)"/>
      <circle cx="320" cy="170" r="34" fill="none" stroke="#52525b" stroke-width="2.5"/>
      <path d="M298 184l16-18 12 12 10-10 14 16H298z" fill="#71717a"/>
      <circle cx="310" cy="158" r="4" fill="#a1a1aa"/>
      <text x="320" y="242" text-anchor="middle" fill="#a1a1aa" font-family="system-ui,-apple-system,sans-serif" font-size="18" font-weight="600">
        Vista previa de portada
      </text>
      <text x="320" y="268" text-anchor="middle" fill="#71717a" font-family="system-ui,-apple-system,sans-serif" font-size="13">
        Sube una imagen o pega una URL en el paso 1
      </text>
    </svg>`
  );

const formatPriceLabel = (price) => {
  const num = Number(price);
  if (!Number.isFinite(num) || num <= 0) return 'Entrada libre';
  return `$${num.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const EventCardPreview = ({ eventData, functions = [], newFunction = null }) => {
  const previewModel = useMemo(() => {
    const built = buildHomePreviewEvent(eventData || {}, functions, newFunction);
    return {
      ...built,
      image_url: built.image_url || EDITORIAL_POSTER_FALLBACK,
    };
  }, [eventData, functions, newFunction]);

  const totalFunctions =
    functions.length > 0
      ? functions.length
      : newFunction?.date || eventData?.event_date
        ? 1
        : 0;

  const capacity = Number(eventData?.total_tickets) || 0;

  return (
    <div className={styles.previewShell}>
      <div className={styles.previewHeader}>
        <h3 className={styles.previewTitle}>Vista previa en Inicio</h3>
        <Badge variant="default" size="small" rounded>
          En vivo
        </Badge>
      </div>

      <div className={styles.previewCardStage} aria-label="Vista previa de tarjeta de evento">
        <EventCardPremium event={previewModel} onClick={() => {}} />
      </div>

      <div className={styles.previewMetricsRow}>
        <div className={styles.previewMetricCell}>
          <span className={styles.previewMetricLabel}>Precio</span>
          <span className={styles.previewMetricValue}>
            {formatPriceLabel(eventData?.price)}
          </span>
        </div>

        <div className={styles.previewMetricCell}>
          <span className={styles.previewMetricLabel}>Aforo</span>
          <span className={styles.previewMetricValue}>
            {capacity > 0 ? capacity.toLocaleString('es-MX') : '—'}
          </span>
        </div>

        <div className={styles.previewMetricCell}>
          <span className={styles.previewMetricLabel}>Funciones</span>
          <span className={styles.previewMetricValue}>{totalFunctions}</span>
        </div>
      </div>

      <p className={styles.previewNote}>
        Esta es la tarjeta real que aparecerá en el catálogo público de LaikaClub.
      </p>
    </div>
  );
};

export default EventCardPreview;
