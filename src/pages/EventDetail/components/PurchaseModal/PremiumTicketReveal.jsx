import React from "react";
import { Icon } from "../../../../components";

const PremiumTicketReveal = ({ event, ticketData, onClose, navigate }) => {
  return (
    <div className="premium-reveal-container animate-in fade-in zoom-in duration-700">
      {/* MARCO INDUSTRIAL DE VISTA COMPLETA */}
      <div className="industrial-wave-frame">
        <div className="wave-layer horizontal"></div>
        <div className="wave-layer vertical"></div>
      </div>

      <div className="congrats-header">
        <h1 className="congrats-text-premium">
          ¡FELICIDADES!
        </h1>
        <p className="congrats-subtitle-premium">
          [ BOLETO AUTORIZADO Y VINCULADO AL PORTADOR ]
        </p>
      </div>

      <div className="industrial-ticket-card">
        <div className="ticket-inner-glow"></div>
        
        {/* Ticket Header */}
        <div className="ticket-header-reveal">
          <div className="laika-badge-reveal">
            LAIKA MAIN INFRASTRUCTURE
          </div>
          <div className="ticket-serial-reveal">
            #LK-{Math.floor(100000 + Math.random() * 900000)}
          </div>
        </div>

        {/* Event Body */}
        <div className="ticket-main-info-reveal">
          <div className="event-name-reveal-group">
            <span className="tiny-label">EVENTO / EVENT</span>
            <h2 className="event-title-reveal">
              {event?.name?.toUpperCase() || "EVENTO SELECCIONADO"}
            </h2>
          </div>

          <div className="ticket-details-grid-reveal">
            <div className="detail-reveal-item">
              <span className="tiny-label">ZONA / ZONE</span>
              <p className="detail-reveal-value">
                {ticketData?.section?.name?.toUpperCase() || "SECCIÓN GENERAL"}
              </p>
            </div>
            <div className="detail-reveal-item">
              <span className="tiny-label">ASIENTO / SEAT</span>
              <p className="detail-reveal-value">
                {ticketData?.seatNames || "Fila 1, S1"}
              </p>
            </div>
          </div>

          <div className="ticket-footer-reveal">
            <div className="qr-box-reveal">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LAIKA-TICKET-VALID" 
                alt="QR Code"
                className="qr-image-reveal"
              />
            </div>
            <div className="price-tag-reveal">
              <span className="tiny-label">TOTAL PAID</span>
              <div className="price-value-reveal">
                ${ticketData?.price || "0,00"} MXN
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="reveal-actions-group">
        <button 
          className="btn-industrial-glow reveal-btn-main"
          onClick={() => window.print()}
        >
          <Icon name="download" size={20} />
          <span className="reveal-btn-label">VER MI BOLETO PDF</span>
        </button>

        <button 
          className="reveal-btn-secondary"
          onClick={() => {
            onClose();
            navigate("/user/tickets");
          }}
        >
          <Icon name="ticket" size={20} />
          <span className="reveal-btn-label">VER MIS BOLETOS</span>
        </button>
      </div>

      <div className="reveal-footer-legal">
         <p>ESTE DOCUMENTO ES UN COMPROBANTE DIGITAL DE PROPIEDAD.</p>
      </div>
    </div>
  );
};

export default PremiumTicketReveal;
