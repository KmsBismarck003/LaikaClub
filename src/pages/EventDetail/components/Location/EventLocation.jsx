import React from 'react';
import { Icon } from "../../../../components";
import './EventLocation.css';

export default function EventLocation({ displayVenue, displayCity }) {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayVenue + " " + displayCity)}`;

  return (
    <div className="location-section-glass">
      <div className="location-header">
        <h3 className="section-label-premium">
          <Icon name="mapPin" size={16} />
          Ubicación del evento
        </h3>
        {(displayVenue || displayCity) && (
          <p className="location-venue-detail">
            {[displayVenue, displayCity].filter(Boolean).join(' — ')}
          </p>
        )}
      </div>

      <div className="map-wrapper-premium">
        <iframe
          title={`Ubicación: ${displayVenue}`}
          className="map-iframe-industrial"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(displayVenue + " " + displayCity)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="gps-button-container">
        <button
          className="btn-gps-industrial"
          onClick={() => window.open(googleMapsUrl, '_blank')}
        >
          <Icon name="mapPin" size={14} />
          Abrir en Google Maps
        </button>
      </div>
    </div>
  );
}
