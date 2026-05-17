import React from 'react';
import { Icon } from "../../../../components";

export default function EventLocation({ displayVenue, displayCity }) {
  return (
    <div className="location-section">
      <h3 className="section-label-premium">
        <Icon name="mapPin" size={16} /> Ubicación Coca-Cola Arena
      </h3>
      <div
        className="google-mini-map"
        style={{
          borderRadius: "0",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <iframe
          title="Ubicación Estadio GNP Seguros"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{
            border: 0,
            filter:
              "invert(90%) hue-rotate(180deg) brightness(0.9) contrast(1.2)",
          }}
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3763.154175971375!2d-99.0960131!3d19.405743400000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1fc241cd2cc61%3A0xd994597d3d690170!2sEstadio%20GNP%20Seguros!5e0!3m2!1ses-419!2smx!4v1772623971740!5m2!1ses-419!2smx"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
      <button
        className="google-maps-btn"
        onClick={() =>
          window.open(
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayVenue + " " + displayCity)}`,
            "_blank",
          )
        }
      >
        Abrir en Navegador GPS →
      </button>
    </div>
  );
}
