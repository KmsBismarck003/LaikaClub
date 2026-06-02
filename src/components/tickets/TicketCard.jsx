import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import TicketInfoSection from './TicketInfoSection';
import TicketQRSection from './TicketQRSection';
import { extractTicketData, buildPdfFilename } from './ticketHelpers';
import './ticket.styles.css';

/**
 * @component TicketCard
 * @description Componente principal del boleto físico-digital (phygital) de LAIKA CLUB.
 * Orquesta los sub-componentes TicketInfoSection y TicketQRSection, maneja la lógica
 * de descarga PDF / impresión, y consume datos dinámicos del backend vía prop `ticket`.
 *
 * @example
 * <TicketCard ticket={ticketObjectFromAPI} />
 */
const TicketCard = ({ ticket }) => {
  const ticketRef = useRef(null);

  // ── Extracción de datos del backend ──────────────────────────────────────
  const {
    eventName,
    eventSubtitle,
    location,
    userName,
    ticketType,
    price,
    ticketCode,
    eventDate,
    eventImage,
    status,
    seatNumber,
    orderNumber,
  } = extractTicketData(ticket);

  // ── PDF Download ──────────────────────────────────────────────────────────
  const handleDownloadPDF = useCallback(async () => {
    const element = ticketRef.current;
    if (!element) return;

    // Ocultar UI no imprimible
    const actionsEl = element.closest('.tk-wrapper')?.querySelector('.tk-actions');
    const noteEl = element.closest('.tk-wrapper')?.querySelector('.tk-note');
    if (actionsEl) actionsEl.style.visibility = 'hidden';
    if (noteEl) noteEl.style.visibility = 'hidden';

    try {
      const canvas = await html2canvas(element, {
        scale: 3,           // Alta resolución para impresión
        useCORS: true,
        logging: false,
        backgroundColor: null,
        removeContainer: true,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdfWidth = 260;  // mm — formato apaisado estándar
      const pdfHeight = (canvas.height / canvas.width) * pdfWidth;

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [pdfHeight, pdfWidth],
        compress: false,
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
      pdf.save(buildPdfFilename(ticketCode, eventName));
    } catch (error) {
      console.error('[TicketCard] Error generando PDF:', error);
    } finally {
      if (actionsEl) actionsEl.style.visibility = '';
      if (noteEl) noteEl.style.visibility = '';
    }
  }, [ticketCode, eventName]);

  // ── Print ─────────────────────────────────────────────────────────────────
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // ── Guard: datos mínimos requeridos ───────────────────────────────────────
  if (!ticket) return null;

  return (
    <div className="tk-wrapper">

      {/* ════════ BOLETO PHYGITAL ════════ */}
      <article
        ref={ticketRef}
        className="tk-card"
        aria-label={`Boleto de acceso: ${eventName}`}
        role="document"
      >
        {/* Textura de papel de fondo */}
        <div className="tk-card__paper-texture" aria-hidden="true" />

        {/* Sello de agua corporativo */}
        <div className="tk-card__watermark" aria-hidden="true">LAIKA</div>

        {/* ── COLUMNA IZQUIERDA: Fotografía del evento ── */}
        <div className="tk-card__image-col">
          {/* Logo de la marca overlay */}
          <img
            src="/logob.png"
            alt="LAIKA Club Logo"
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              height: '18px',
              width: 'auto',
              zIndex: 3,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
              pointerEvents: 'none',
            }}
          />
          <img
            src={eventImage}
            alt={`Fotografía del evento: ${eventName}`}
            className="tk-card__image"
            crossOrigin="anonymous"
            draggable="false"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80';
            }}
          />
          {/* Vignette lateral para transición suave hacia el contenido */}
          <div className="tk-card__image-vignette" aria-hidden="true" />

          {/* Número de edición / tiraje — elemento de colección */}
          <div className="tk-card__edition-label" aria-hidden="true">
            <span className="tk-card__edition-text">EDICIÓN DIGITAL</span>
          </div>
        </div>

        {/* Separador con muescas de troquelado */}
        <div className="tk-card__die-cut" aria-hidden="true">
          <div className="tk-card__die-notch tk-card__die-notch--top" />
          <div className="tk-card__die-cut-line" />
          <div className="tk-card__die-notch tk-card__die-notch--bottom" />
        </div>

        {/* ── COLUMNA CENTRAL: Información editorial ── */}
        <TicketInfoSection
          eventName={eventName}
          eventSubtitle={eventSubtitle}
          location={location}
          userName={userName}
          ticketType={ticketType}
          price={price}
          eventDate={eventDate}
          seatNumber={seatNumber}
          orderNumber={orderNumber}
        />

        {/* Separador con muescas de troquelado */}
        <div className="tk-card__die-cut" aria-hidden="true">
          <div className="tk-card__die-notch tk-card__die-notch--top" />
          <div className="tk-card__die-cut-line" />
          <div className="tk-card__die-notch tk-card__die-notch--bottom" />
        </div>

        {/* ── COLUMNA DERECHA: QR + Estado ── */}
        <TicketQRSection
          ticketCode={ticketCode}
          status={status}
        />

      </article>
      {/* ════════ FIN BOLETO ════════ */}

      {/* ── Controles de acción (excluidos del PDF/print) ── */}
      <div className="tk-actions" role="group" aria-label="Acciones del boleto">
        <button
          id="btn-ticket-download-pdf"
          className="tk-actions__btn tk-actions__btn--primary"
          onClick={handleDownloadPDF}
          aria-label="Descargar boleto en formato PDF"
        >
          {/* SVG: Download icon */}
          <svg className="tk-actions__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>Descargar PDF</span>
        </button>

        <button
          id="btn-ticket-print"
          className="tk-actions__btn tk-actions__btn--secondary"
          onClick={handlePrint}
          aria-label="Imprimir boleto"
        >
          {/* SVG: Printer icon */}
          <svg className="tk-actions__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          <span>Imprimir Boleto</span>
        </button>
      </div>

      <p className="tk-note">
        Presenta este boleto en formato digital o impreso en la entrada del evento.
        El código QR es de uso único y personal.
      </p>

    </div>
  );
};

TicketCard.propTypes = {
  /** Objeto ticket crudo proveniente del backend/API. Ver ticketHelpers.js para el contrato. */
  ticket: PropTypes.object.isRequired,
};

export default TicketCard;
