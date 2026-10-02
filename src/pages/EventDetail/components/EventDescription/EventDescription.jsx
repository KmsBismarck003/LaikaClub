import React from 'react';
import { Icon } from '../../../../components';
import './EventDescription.css';

const getCategoryIcon = (cat) => {
  switch (cat?.toLowerCase()) {
    case 'concert': return 'music';
    case 'sport': return 'activity';
    case 'theater': return 'video';
    case 'festival': return 'compass';
    default: return 'calendar';
  }
};

const getCategoryLabel = (cat) => {
  switch (cat?.toLowerCase()) {
    case 'concert': return 'Concierto';
    case 'sport': return 'Deporte';
    case 'theater': return 'Teatro';
    case 'festival': return 'Festival';
    case 'other': return 'Otro';
    default: return cat || 'Evento';
  }
};

/**
 * EventDescription — Muestra la descripción e información del evento.
 *
 * REGLA: Si no hay descripción, no se muestra texto inventado.
 * El grid de hechos siempre se muestra si hay datos reales del evento.
 *
 * @param {object} event — objeto del evento de la API
 * @param {boolean} isEventSeating — si el evento tiene asientos numerados
 */
export default function EventDescription({ event, isEventSeating }) {
  if (!event) return null;

  return (
    <div className="event-description">
      <h2>Acerca del evento</h2>

      {/* Event Facts Grid — siempre visible si hay datos */}
      <div className="event-facts-grid-premium">
        {event.category && (
          <div className="fact-item-glass">
            <Icon name={getCategoryIcon(event.category)} size={18} className="fact-icon-blue" />
            <div className="fact-details">
              <span className="fact-label">Categoría</span>
              <span className="fact-value">{getCategoryLabel(event.category)}</span>
            </div>
          </div>
        )}

        {event.duration_minutes && (
          <div className="fact-item-glass">
            <Icon name="clock" size={18} className="fact-icon-blue" />
            <div className="fact-details">
              <span className="fact-label">Duración</span>
              <span className="fact-value">{event.duration_minutes} min</span>
            </div>
          </div>
        )}

        {event.age_rating && (
          <div className="fact-item-glass">
            <Icon name="user" size={18} className="fact-icon-blue" />
            <div className="fact-details">
              <span className="fact-label">Clasificación</span>
              <span className="fact-value">{event.age_rating}</span>
            </div>
          </div>
        )}

        <div className="fact-item-glass">
          <Icon name="ticket" size={18} className="fact-icon-blue" />
          <div className="fact-details">
            <span className="fact-label">Tipo Acceso</span>
            <span className="fact-value">{isEventSeating ? 'Numerado' : 'General'}</span>
          </div>
        </div>
      </div>

      {/* Descripción del evento — solo si existe en los datos */}
      {event.description && (
        <div className="description-text-wrapper">
          {event.description.split('\n').filter(Boolean).map((para, i) => (
            <p key={i} className="description-paragraph">{para}</p>
          ))}
        </div>
      )}
    </div>
  );
}
