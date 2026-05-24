import React from 'react';
import './EventPoster.css';

export default function EventPoster({ imageUrl, eventName }) {
  if (!imageUrl) return null;
  return (
    <div className="event-poster-card-premium">
      <img src={imageUrl} alt={eventName} className="event-poster-image" />
      <div className="event-poster-overlay">
        <span className="poster-badge">🎫 Entrada General</span>
      </div>
    </div>
  );
}
