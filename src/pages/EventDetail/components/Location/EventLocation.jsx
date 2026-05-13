import React from 'react';
import { Icon } from "../../../../components";
import './EventLocation.css';

const EventLocation = ({
  displayVenue,
  displayCity
}) => {
  return (
    <div className="location-section-glass">
      <div className="location-header">
        <h3 className="section-label-premium">
          <Icon name="mapPin" size={16} /> Ubicación / {displayVenue}
        </h3>
        <div className="location-venue-detail">
          {displayVenue} • {displayCity}
        </div>
      </div>
      
      <div className="map-wrapper-premium">
        <iframe
          title="Ubicación Inmueble"
          width="100%"
          height="100%"
          frameBorder="0"
          className="map-iframe-industrial"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3763.154175971375!2d-99.0960131!3d19.405743400000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1fc241cd2cc61%3A0xd994597d3d690170!2sEstadio%20GNP%20Seguros!5e0!3m2!1ses-419!2smx!4v1772623971740!5m2!1ses-419!2smx"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      <div className="gps-button-container">
        <button
          className="btn-gps-industrial"
          onClick={() =>
            window.open(
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayVenue + " " + displayCity)}`,
              "_blank"
            )
          }
        >
          OPEN GPS NAVIGATION SYSTEM →
        </button>
      </div>
    </div>
  );
};

export default EventLocation;
