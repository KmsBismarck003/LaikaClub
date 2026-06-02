import React from 'react';
import PropTypes from 'prop-types';
import { buildQRUrl, resolveTicketStatus } from './ticketFormatters';

/**
 * @component TicketQRSection
 * @description Sub-componente dedicado a la sección derecha del boleto:
 * código QR de alta resolución, código alfanumérico y badge de estado de acceso.
 * Diseñado para impresión y renderizado de pantalla sin degradación visual.
 */
const TicketQRSection = ({ ticketCode, status }) => {
  const { label: statusLabel, cssClass: statusClass, isValid } = resolveTicketStatus(status);
  const qrUrl = buildQRUrl(ticketCode, 280);

  return (
    <div className="tk-qr-section" aria-label="Sección de acceso QR">

      {/* Perforación decorativa superior (efecto phygital) */}
      <div className="tk-qr__perforation-top" aria-hidden="true" />

      {/* Contenedor principal QR */}
      <div className="tk-qr__inner">

        {/* Etiqueta de sección */}
        <span className="tk-qr__label">CÓDIGO DE ACCESO</span>

        {/* QR Image con borde troquelado */}
        <div className="tk-qr__frame" role="img" aria-label={`Código QR de acceso: ${ticketCode}`}>
          <div className="tk-qr__corner tk-qr__corner--tl" aria-hidden="true" />
          <div className="tk-qr__corner tk-qr__corner--tr" aria-hidden="true" />
          <div className="tk-qr__corner tk-qr__corner--bl" aria-hidden="true" />
          <div className="tk-qr__corner tk-qr__corner--br" aria-hidden="true" />
          <img
            src={qrUrl}
            alt={`QR de acceso: ${ticketCode}`}
            className="tk-qr__image"
            crossOrigin="anonymous"
            loading="eager"
            draggable="false"
          />
        </div>

        {/* Código alfanumérico */}
        <div className="tk-qr__code-block" aria-label="Código alfanumérico del boleto">
          <span className="tk-qr__code-text">{ticketCode}</span>
        </div>

        {/* Badge de estado */}
        <div
          className={`tk-qr__status-badge ${statusClass}`}
          role="status"
          aria-label={`Estado del boleto: ${statusLabel}`}
        >
          <span
            className={`tk-qr__status-dot ${isValid ? 'tk-qr__status-dot--pulse' : ''}`}
            aria-hidden="true"
          />
          <span className="tk-qr__status-text">{statusLabel}</span>
        </div>

      </div>

      {/* Perforación decorativa inferior (efecto phygital) */}
      <div className="tk-qr__perforation-bottom" aria-hidden="true" />

    </div>
  );
};

TicketQRSection.propTypes = {
  /** Código alfanumérico único del boleto (se usa para generar el QR y mostrarlo) */
  ticketCode: PropTypes.string.isRequired,
  /** Estado raw del boleto desde el backend (active, used, expired, etc.) */
  status: PropTypes.string,
};

TicketQRSection.defaultProps = {
  status: 'active',
};

export default TicketQRSection;
