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

export default function EventDescription({ event, isEventSeating }) {
  if (!event) return null;

  return (
    <div className="event-description">
      <h2>Acerca del evento</h2>
      
      {/* Event Facts Grid */}
      <div className="event-facts-grid-premium">
        <div className="fact-item-glass">
          <Icon name={getCategoryIcon(event.category)} size={18} className="fact-icon-blue" />
          <div className="fact-details">
            <span className="fact-label">Categoría</span>
            <span className="fact-value">{getCategoryLabel(event.category)}</span>
          </div>
        </div>
        
        <div className="fact-item-glass">
          <Icon name="clock" size={18} className="fact-icon-blue" />
          <div className="fact-details">
            <span className="fact-label">Duración</span>
            <span className="fact-value">~2 horas aprox.</span>
          </div>
        </div>
        
        <div className="fact-item-glass">
          <Icon name="user" size={18} className="fact-icon-blue" />
          <div className="fact-details">
            <span className="fact-label">Clasificación</span>
            <span className="fact-value">
              {event.category?.toLowerCase() === 'festival' || event.category?.toLowerCase() === 'concert' ? '+18 años' : 'Todo Público'}
            </span>
          </div>
        </div>
        
        <div className="fact-item-glass">
          <Icon name="ticket" size={18} className="fact-icon-blue" />
          <div className="fact-details">
            <span className="fact-label">Tipo Acceso</span>
            <span className="fact-value">{isEventSeating ? 'Numerado' : 'General'}</span>
          </div>
        </div>
      </div>

      <div className="description-text-wrapper">
        {event.description ? (
          event.description.split('\n').filter(Boolean).map((para, i) => (
            <p key={i} className="description-paragraph">{para}</p>
          ))
        ) : (
          <p className="description-paragraph">
            ¡Prepárate para una noche espectacular! Disfruta de este evento exclusivo de {getCategoryLabel(event.category).toLowerCase()} con la mejor producción, iluminación de primer nivel y un sistema de audio de última tecnología diseñado para envolverte en cada momento. Una experiencia inolvidable que no te querrás perder.
          </p>
        )}
      </div>
    </div>
  );
}
