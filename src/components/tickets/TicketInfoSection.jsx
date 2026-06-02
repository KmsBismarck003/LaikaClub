import React from 'react';
import PropTypes from 'prop-types';
import { formatTicketDate, formatTicketPrice, formatZoneLabel } from './ticketFormatters';

/**
 * @component TicketInfoSection
 * @description Sub-componente central del boleto. Renderiza toda la información
 * editorial del evento: nombre, subtítulo, fecha/hora, venue, zona, portador y precio.
 * Diseñado con jerarquía tipográfica de nivel editorial.
 */
const TicketInfoSection = ({
  eventName,
  eventSubtitle,
  location,
  userName,
  ticketType,
  price,
  eventDate,
  seatNumber,
  orderNumber,
}) => {
  const formattedDate = formatTicketDate(eventDate);
  const formattedPrice = formatTicketPrice(price);
  const zoneLabel = formatZoneLabel(ticketType);

  return (
    <div className="tk-info-section">

      {/* ── HEADER: Marca + Número de Orden ── */}
      <div className="tk-info__header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/logoN.PNG"
            alt="LAIKA CLUB"
            style={{
              height: '16px',
              width: 'auto',
              display: 'block',
              objectFit: 'contain',
            }}
          />
        </div>
        {orderNumber && (
          <span className="tk-info__order-num">ORD. #{orderNumber}</span>
        )}
      </div>

      {/* ── TÍTULO EDITORIAL ── */}
      <div className="tk-info__title-block">
        <h1 className="tk-info__event-name">{eventName}</h1>
        <p className="tk-info__event-subtitle">{eventSubtitle}</p>
      </div>

      {/* ── FECHA / HORA ── */}
      <div className="tk-info__datetime-block" aria-label="Fecha y hora del evento">
        {formattedDate ? (
          <>
            <div className="tk-info__date-day">
              <span className="tk-info__date-number">{formattedDate.day}</span>
              <span className="tk-info__date-separator" aria-hidden="true" />
              <span className="tk-info__date-month">{formattedDate.month}</span>
            </div>
            <div className="tk-info__date-time">{formattedDate.time}</div>
          </>
        ) : (
          <span className="tk-info__date-tbd">FECHA POR CONFIRMAR</span>
        )}
      </div>

      {/* ── VENUE ── */}
      <div className="tk-info__venue" aria-label={`Ubicación: ${location}`}>
        <span className="tk-info__venue-icon" aria-hidden="true">
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 0C3.24 0 1 2.24 1 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.5C5.17 6.5 4.5 5.83 4.5 5S5.17 3.5 6 3.5 7.5 4.17 7.5 5 6.83 6.5 6 6.5z" fill="currentColor"/>
          </svg>
        </span>
        <span className="tk-info__venue-text">{location}</span>
      </div>

      {/* ── SEPARADOR PERFORADO ── */}
      <div className="tk-info__divider" aria-hidden="true">
        <div className="tk-info__divider-line" />
      </div>

      {/* ── GRILLA DE DATOS DEL BOLETO ── */}
      <dl className="tk-info__data-grid">
        <div className="tk-info__data-cell">
          <dt className="tk-info__data-label">PORTADOR</dt>
          <dd className="tk-info__data-value">{userName}</dd>
        </div>

        <div className="tk-info__data-cell">
          <dt className="tk-info__data-label">ZONA</dt>
          <dd className="tk-info__data-value tk-info__data-value--accent">{zoneLabel}</dd>
        </div>

        {seatNumber && (
          <div className="tk-info__data-cell">
            <dt className="tk-info__data-label">ASIENTO</dt>
            <dd className="tk-info__data-value">{seatNumber}</dd>
          </div>
        )}

        <div className="tk-info__data-cell">
          <dt className="tk-info__data-label">VALOR</dt>
          <dd className="tk-info__data-value">{formattedPrice}</dd>
        </div>
      </dl>

      {/* ── FOOTER LEGAL ── */}
      <p className="tk-info__legal">
        Boleto personal e intransferible · Válido únicamente para la fecha y sede indicadas
      </p>

    </div>
  );
};

TicketInfoSection.propTypes = {
  eventName: PropTypes.string.isRequired,
  eventSubtitle: PropTypes.string,
  location: PropTypes.string,
  userName: PropTypes.string,
  ticketType: PropTypes.string,
  price: PropTypes.number,
  eventDate: PropTypes.string,
  seatNumber: PropTypes.string,
  orderNumber: PropTypes.string,
};

TicketInfoSection.defaultProps = {
  eventSubtitle: 'EVENTO ESPECIAL',
  location: 'LAIKA CLUB',
  userName: 'PORTADOR DEL BOLETO',
  ticketType: 'GENERAL',
  price: 0,
  eventDate: null,
  seatNumber: null,
  orderNumber: null,
};

export default TicketInfoSection;
