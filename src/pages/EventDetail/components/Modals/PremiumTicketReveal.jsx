import React from 'react';
import { Icon } from '../../../../components';
import { QRCodeSVG } from 'qrcode.react';

const PremiumTicketReveal = ({ event, ticketData, onClose, navigate }) => {
  const txnId = Math.floor(100000000 + Math.random() * 900000000);
  
  return (
    <div className="payment-status-view success-final-view industrial-glow-frame success-glow">
      <div className="scan-line-effect"></div>
      
      <div className="reveal-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 className="congrats-text-premium" style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 950, margin: 0 }}>
          ¡FELICIDADES!
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', letterSpacing: '2px' }}>
          TU ACCESO HA SIDO VINCULADO EXITOSAMENTE
        </p>
      </div>

      <div className="premium-ticket-container" style={{ position: 'relative', padding: '20px' }}>
        {/* El Boleto Estilo Constructor */}
        <div className="industrial-ticket-card">
          <div className="ticket-inner-glow"></div>
          <div className="ticket-top-section" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
             <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>EVENT_AUTH_SECURE</span>
             <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>ID: LK-{txnId}</span>
          </div>

          <div className="ticket-main-info" style={{ display: 'flex', gap: '20px' }}>
            <div className="qr-holder" style={{ background: '#fff', padding: '6px', borderRadius: '4px' }}>
              <QRCodeSVG value={`LAIKA-TICKET-${txnId}`} size={80} />
            </div>
            <div className="ticket-text-info" style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '0 0 5px 0' }}>{event?.name?.toUpperCase()}</h2>
              <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '10px' }}>
                {ticketData?.section?.name?.toUpperCase() || 'ASIGNACIÓN TÁCTICA'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.5rem', opacity: 0.4 }}>ASIENTOS</label>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{ticketData?.seatNames || 'A-12'}</span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.5rem', opacity: 0.4 }}>TOTAL</label>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>${ticketData?.price || '0'} MXN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="final-actions-grid" style={{ display: 'grid', gap: '10px', marginTop: '20px', width: '100%' }}>
        <button 
          className="karol-g-pay-btn" 
          onClick={() => window.print()}
          style={{ width: '100%', border: '1px solid #fff' }}
        >
          <Icon name="fileText" size={16} /> VER MI BOLETO PDF
        </button>
        <button 
          className="karol-g-pay-btn" 
          onClick={() => { onClose(); navigate('/profile'); }}
          style={{ width: '100%', background: '#fff', color: '#000' }}
        >
          <Icon name="ticket" size={16} /> VER MIS BOLETOS
        </button>
      </div>
    </div>
  );
};

export default PremiumTicketReveal;
