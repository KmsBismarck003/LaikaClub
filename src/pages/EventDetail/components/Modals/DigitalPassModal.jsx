import React from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Ticket, 
  Compass, 
  X 
} from 'lucide-react';
import { getImageUrl } from '../../../../utils/imageUtils';
import './DigitalPassModal.css';

/**
 * DigitalPassModal - Modal de confirmación de compra limpio y elegante
 * Muestra el estado de confirmación, la información e imagen del evento,
 * y los botones para ir a boletos o seguir explorando.
 */
const DigitalPassModal = ({
  isOpen,
  onClose,
  event,
  directTicketData,
  displayDate,
  displayTime,
  formatDate,
  formatTime,
  navigate
}) => {
  if (!isOpen) return null;

  // Extracción de datos del evento y compra
  const eventName = directTicketData?.event?.name || event?.name || 'Evento Oficial';
  const rawImage = directTicketData?.event?.image_url || directTicketData?.event?.image || event?.image_url || event?.image || event?.banner_url;
  const eventImage = rawImage ? getImageUrl(rawImage.split(',')[0]) : '/assets/default_event.jpg';

  const venueName = directTicketData?.functionData?.venue_name || directTicketData?.event?.venue_name || event?.venue_name || 'LAIKA ARENA';
  
  const rawDate = directTicketData?.functionData?.date || displayDate || event?.date;
  const dateFormatted = rawDate 
    ? (formatDate ? formatDate(rawDate) : new Date(rawDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })) 
    : 'Fecha por confirmar';

  const rawTime = directTicketData?.functionData?.time || displayTime || event?.time;
  const timeFormatted = rawTime 
    ? (formatTime ? `${formatTime(rawTime)} hrs` : `${String(rawTime).slice(0, 5)} hrs`) 
    : '21:00 hrs';

  const sectionName = directTicketData?.section?.name || 'General';
  
  const seatsList = directTicketData?.seats?.length > 0
    ? directTicketData.seats.map(s => (typeof s === 'object' ? s.name || s.id : s)).join(', ')
    : null;

  const totalAmount = directTicketData?.total 
    ? `$${parseFloat(directTicketData.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
    : null;

  const handleGoToTickets = () => {
    if (onClose) onClose();
    if (navigate) {
      navigate('/user/tickets');
    }
  };

  const handleKeepExploring = () => {
    if (onClose) onClose();
    if (navigate) {
      navigate('/');
    }
  };

  return (
    <div 
      className="digital-pass-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="digital-pass-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button 
          type="button"
          className="digital-pass-close-btn"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          <X size={16} />
        </button>

        {/* 1. Header de Confirmación */}
        <div className="digital-pass-header">
          <div className="digital-pass-success-icon">
            <CheckCircle2 size={30} strokeWidth={2.4} />
          </div>
          <h2 className="digital-pass-headline">
            ¡TRANSACCIÓN EXITOSA!
          </h2>
          <p className="digital-pass-subline">
            Tus boletos han sido confirmados y guardados en tu cuenta.
          </p>
        </div>

        {/* 2. Tarjeta con Imagen e Información del Evento */}
        <div className="digital-pass-event-card">
          <div className="digital-pass-event-media">
            <img 
              src={eventImage} 
              alt={eventName} 
              className="digital-pass-event-img"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80';
              }}
            />
            <div className="digital-pass-event-media-gradient" />
            <span className="digital-pass-event-badge">ACCESO CONFIRMADO</span>
          </div>

          <div className="digital-pass-event-body">
            <h3 className="digital-pass-event-title">
              {eventName}
            </h3>

            <div className="digital-pass-info-list">
              <div className="digital-pass-info-row">
                <Calendar size={14} />
                <span>{dateFormatted} · {timeFormatted}</span>
              </div>
              <div className="digital-pass-info-row">
                <MapPin size={14} />
                <span>{venueName}</span>
              </div>
              <div className="digital-pass-info-row">
                <Ticket size={14} />
                <span>
                  {sectionName}
                  {seatsList ? ` · Asiento(s): ${seatsList}` : ''}
                </span>
              </div>
            </div>

            {totalAmount && (
              <div className="digital-pass-summary-strip">
                <span className="digital-pass-section-pill">PAGO APROBADO</span>
                <span className="digital-pass-price-val">{totalAmount}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Botones: Ir a Boletos o Seguir Explorando */}
        <div className="digital-pass-actions">
          <button 
            type="button"
            className="digital-pass-btn digital-pass-btn--primary"
            onClick={handleGoToTickets}
          >
            <Ticket size={16} />
            <span>IR A MIS BOLETOS</span>
          </button>

          <button 
            type="button"
            className="digital-pass-btn digital-pass-btn--secondary"
            onClick={handleKeepExploring}
          >
            <Compass size={16} />
            <span>SEGUIR EXPLORANDO</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DigitalPassModal;
