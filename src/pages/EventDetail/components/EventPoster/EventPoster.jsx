import React from 'react';
import './EventPoster.css';

/**
 * EventPoster — Muestra el póster del evento como fallback elegante
 * cuando no hay galería ni mapa de asientos.
 *
 * @param {string} imageUrl — URL de la imagen del evento
 * @param {string} eventName — Nombre del evento (para accesibilidad)
 */
export default function EventPoster({ imageUrl, eventName }) {
  if (!imageUrl) return null;

  return (
    <div className="ep-card">
      <div className="ep-image-wrapper">
        <img
          src={imageUrl}
          alt={`Póster del evento: ${eventName}`}
          className="ep-image"
          draggable="false"
          loading="eager"
        />
        {/* Overlays de profundidad */}
        <div className="ep-vignette" aria-hidden="true" />
        <div className="ep-shine" aria-hidden="true" />
      </div>
    </div>
  );
}
