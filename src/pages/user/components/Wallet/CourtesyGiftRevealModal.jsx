import React, { useState, useEffect } from 'react';
import './CourtesyGiftRevealModal.css';

export default function CourtesyGiftRevealModal({ isOpen, ticket, onClose, onOpenTicket }) {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRevealed(false);
    }
  }, [isOpen]);

  if (!isOpen || !ticket) return null;

  const eventName = ticket.event?.name || ticket.eventName || ticket.event_name || 'Evento Exclusivo';
  const dateRaw = ticket.event?.date || ticket.date || ticket.purchase_date;
  const fmtDate = dateRaw
    ? new Date(dateRaw).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : 'Fecha por confirmar';
  const venue = ticket.event?.venue_name || ticket.venue || 'LAIKA Club';
  const recipient = ticket.recipient_type || ticket.recipientType || 'Invitado Especial';
  const motive = ticket.courtesy_motive || ticket.courtesyMotive;

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleFinish = () => {
    if (onOpenTicket) {
      onOpenTicket(ticket);
    } else {
      onClose();
    }
  };

  return (
    <div className="gift-modal-backdrop" onClick={onClose}>
      <div className="gift-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="gift-modal-aura" />

        <button className="gift-close-corner" onClick={onClose} aria-label="Cerrar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="gift-content">
          {!isRevealed ? (
            /* ── FASE 1: INVITACIÓN SELLADA / REGALO ── */
            <>
              <div className="gift-vip-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Invitación VIP Exclusiva
              </div>

              <div className="gift-box-wrapper">
                <div className="gift-box-glow-ring" />
                <div className="gift-box-icon-container">
                  <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 12 20 22 4 22 4 12" />
                    <rect x="2" y="7" width="20" height="5" />
                    <line x1="12" y1="22" x2="12" y2="7" />
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                  </svg>
                </div>
              </div>

              <h2 className="gift-title">¡Tienes una sorpresa especial!</h2>
              <p className="gift-subtitle">
                Has recibido un acceso oficial de cortesía. Alguien especial te ha reservado un lugar para vivir la experiencia en LAIKA Club.
              </p>

              <button className="gift-primary-btn" onClick={handleReveal}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Abrir Invitación
              </button>

              <button className="gift-dismiss-btn" onClick={onClose}>
                Ver más tarde
              </button>
            </>
          ) : (
            /* ── FASE 2: REVELACIÓN WOW DEL EVENTO ── */
            <>
              <div className="gift-vip-badge" style={{ background: 'rgba(139, 92, 246, 0.15)', borderColor: '#8b5cf6', color: '#c4b5fd' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Acceso de Cortesía Confirmado
              </div>

              <h2 className="gift-title" style={{ fontSize: '1.45rem', marginBottom: '0.4rem' }}>
                ¡Estás invitado oficialmente!
              </h2>
              <p className="gift-subtitle" style={{ marginBottom: '1.4rem' }}>
                Tu pase de cortesía ha quedado acreditado y vinculado a tu cuenta.
              </p>

              {/* Tarjeta del Boleto */}
              <div className="gift-reveal-ticket-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Categoría: {recipient}
                  </span>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#fbbf24', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                    $0 • CORTESÍA
                  </span>
                </div>

                <div className="gift-reveal-event-name">{eventName}</div>

                <div className="gift-reveal-meta-grid">
                  <div className="gift-reveal-meta-item">
                    <span className="gift-reveal-meta-label">Fecha del Evento</span>
                    <span className="gift-reveal-meta-val">{fmtDate}</span>
                  </div>
                  <div className="gift-reveal-meta-item">
                    <span className="gift-reveal-meta-label">Ubicación / Recinto</span>
                    <span className="gift-reveal-meta-val">{venue}</span>
                  </div>
                  <div className="gift-reveal-meta-item">
                    <span className="gift-reveal-meta-label">Zona / Asiento</span>
                    <span className="gift-reveal-meta-val">{ticket.section_name || ticket.sectionName || 'Acceso General'}</span>
                  </div>
                  <div className="gift-reveal-meta-item">
                    <span className="gift-reveal-meta-label">Código de Boleto</span>
                    <span className="gift-reveal-meta-val" style={{ fontFamily: 'monospace', color: '#a78bfa' }}>
                      {ticket.ticket_code || ticket.ticketCode || 'TKT-COURTESY'}
                    </span>
                  </div>
                </div>

                {motive && (
                  <div className="gift-reveal-motive-box">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>Nota: &quot;{motive}&quot;</span>
                  </div>
                )}
              </div>

              <button className="gift-primary-btn" onClick={handleFinish}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <rect x="7" y="7" width="3" height="3" />
                  <rect x="14" y="7" width="3" height="3" />
                  <rect x="7" y="14" width="3" height="3" />
                  <rect x="14" y="14" width="3" height="3" />
                </svg>
                Ver Boleto y Código QR
              </button>

              <button className="gift-dismiss-btn" onClick={onClose}>
                Cerrar y volver a la Wallet
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
