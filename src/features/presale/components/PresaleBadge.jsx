import React from 'react';
import './PresaleBadge.css';

/**
 * PresaleBadge — Indicador visual de que un evento está en preventa exclusiva.
 *
 * Uso: en tarjetas de eventos, detalle del evento, listados.
 * Props:
 *  @param {string}  bankName   - Nombre del banco patrocinador
 *  @param {boolean} isActive   - Si la preventa está activa ahora mismo
 *  @param {string}  [size]     - 'sm' | 'md' (default 'md')
 */
const PresaleBadge = ({ bankName, isActive, size = 'md' }) => {
  if (!isActive) return null;

  return (
    <div className={`presale-badge presale-badge--${size}`} aria-label={`Preventa exclusiva ${bankName}`}>
      <span className="presale-badge-dot" />
      <span className="presale-badge-label">
        PREVENTA {bankName ? `· ${bankName.toUpperCase()}` : ''}
      </span>
    </div>
  );
};

export default PresaleBadge;
