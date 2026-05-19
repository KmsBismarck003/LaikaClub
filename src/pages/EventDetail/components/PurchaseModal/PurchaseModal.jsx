import React, { useState } from "react";
import { Icon } from "../../../../components";
import { useTheme } from "../../../../context";
import PremiumTicketReveal from "./PremiumTicketReveal";
import { getSeatLabel } from "../../utils/helpers";
import "./PurchaseModal.css";

/* ─────────────────────────────────────────────
   MODAL DE COMPRA DIRECTA DE BOLETOS
───────────────────────────────────────────── */
export const PurchaseModal = ({
  isOpen, onClose, isProcessingPayment, isPaymentApproved,
  event, displayDate, displayTime,
  directTicketData, selectedSection,
  paymentMethod, setPaymentMethod,
  cardData, handleCardChange, getFormattedNumber,
  cleanPrice, confirmDirectPayment,
  // Guest Params
  isGuest, guestEmail, setGuestEmail
}) => {
  const [showCvv, setShowCvv] = useState(false);
  const [rememberCard, setRememberCard] = useState(false);
  const { isDark } = useTheme();
  
  const textColor = isDark ? '#fff' : '#000';
  const labelColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.6)';

  if (!isOpen) return null;

  const sectionPrice = cleanPrice(directTicketData?.section?.price || selectedSection?.price || 0);
  const quantity = directTicketData?.quantity || 1;

  // RENDERIZADO DE FASES
  const renderContent = () => {
    // FASE 3: ÉXITO TOTAL (EL PALITO CINEMÁTICO + RENDERING)
    if (isPaymentApproved) {
      return (
        <div className="payment-status-view success-view industrial-glow-frame success-glow">
          <div className="success-visual-anchor success-checkmark-animated">
            <svg className="cinematic-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="25" fill="none" stroke={textColor} strokeWidth="2" />
              <path fill="none" stroke={textColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
          
          <h2 className="success-title-industrial" style={{ color: textColor, textShadow: isDark ? '0 0 20px rgba(255, 255, 255, 0.4)' : 'none' }}>
            ¡AUTORIZACIÓN EXITOSA!
          </h2>
          <div className="success-divider-line" style={{ background: textColor, opacity: 0.3 }}></div>
          <p className="success-msg-technical" style={{ color: labelColor }}>[ PAQUETE DE DATOS GENERADO ]</p>
        </div>
      );
    }

    // FASE 2: VALIDANDO PAGO (RECIÉN RECICLADO)
    if (isProcessingPayment) {
      return (
        <div className="payment-status-view validating-view industrial-glow-frame">
          <div className="scan-line-effect"></div>
          <div className="industrial-loader">
            <div className="loader-ring"></div>
            <div className="loader-ring" style={{ animationDelay: '-0.5s' }}></div>
            <Icon name="shieldCheck" size={48} className="shield-pulse" />
          </div>
          <div className="validating-status-row">
            <h3 className="technical-text" data-text="[ SISTEMA: VALIDANDO TRANSACCIÓN ]">[ SISTEMA: VALIDANDO TRANSACCIÓN ]</h3>
            <div className="industrial-dots-container">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
          <p className="validation-sub">[ ENCRIPTACIÓN TIER-1 ACTIVA ]</p>
          <div className="telemetry-bar-mini">
             <div className="bar-fill-loading"></div>
          </div>
        </div>
      );
    }

    // FASE 1: FORMULARIO
    return (
      <>
        <div className="karol-g-modal-header">
          <h3 style={{ color: textColor }}>[ COMPRA DE BOLETOS ]</h3>
          <button className="karol-g-close-btn" onClick={onClose} aria-label="Cerrar" style={{ color: textColor }}>×</button>
        </div>

        <div className="karol-g-payment-layout">
          <div className="karol-g-info-col">
            <div className="karol-g-event-card">
              <img src={event?.image_url} alt="" />
              <div className="karol-g-event-overlay">
                <h2>{event?.name}</h2>
                <div className="meta">
                  {new Date(displayDate).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })} • {displayTime} HRS
                </div>
              </div>
            </div>

            <div className="karol-g-price-card">
              <div className="subtotal" style={{ color: labelColor }}>ORDEN TÉCNICA: {quantity} TICKET(S)</div>
              <div className="total" style={{ color: textColor }}>${(sectionPrice * quantity).toLocaleString()} MXN</div>
              <div className="karol-g-tech-details" style={{ color: textColor }}>
                <strong style={{ color: textColor }}>UBICACIÓN ASIGNADA</strong><br />
                🎟 Zona: {directTicketData?.section?.name || selectedSection?.name || "Platino VIP"}<br />
                {directTicketData?.seats?.length > 0 && (
                  <>💺 Fila/Asiento: {directTicketData.seats.map(s => getSeatLabel(s, event)).join(', ')}<br /></>
                )}
                🛰 Red: Laika Mainframe
              </div>
            </div>
          </div>

          <div className="karol-g-form-col">
            <h4 className="purchase-form-title" style={{ color: labelColor }}>MÉTODO DE VALIDACIÓN</h4>

            {isGuest && (
              <div className="guest-email-gate animate-in slide-in-from-top-2">
                 <div className="input-with-label" style={{ marginBottom: '1.5rem' }}>
                  <span className="tiny-label" style={{ color: labelColor }}>EMAIL PARA RECIBIR BOLETOS</span>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="ejemplo@email.com"
                    className="karol-g-input-field guest-highlight"
                  />
                  <p className="guest-note">* USADO EXCLUSIVAMENTE PARA EL ENVÍO DEL ARCHIVO.</p>
                </div>
              </div>
            )}

            <div className={'karol-g-method-selector ' + (paymentMethod === 'card' ? 'active' : '')} onClick={() => setPaymentMethod('card')}>
              <div className="purchase-radio-dot"></div>
              <div className="purchase-card-brands">
                <img src="https://img.icons8.com/color/48/visa.png" style={{ height: '18px' }} alt="Visa" />
                <img src="https://img.icons8.com/color/48/mastercard.png" style={{ height: '18px' }} alt="Mastercard" />
              </div>
              <span className="purchase-method-label" style={{ color: textColor }}>TARJETA CRÉDITO / DÉBITO</span>
            </div>

            {paymentMethod === 'card' && (
              <div className="purchase-card-fields animate-in slide-in-from-top-4 duration-500">
                <div className="input-with-label" style={{ marginBottom: '0.8rem' }}>
                  <span className="tiny-label" style={{ color: labelColor }}>NÚMERO DE TARJETA</span>
                  <input
                    type="text" name="number"
                    value={getFormattedNumber(cardData.number)}
                    onChange={handleCardChange}
                    placeholder="**** **** **** ****"
                    className="karol-g-input-field"
                    maxLength={19}
                  />
                </div>
                
                <div className="purchase-card-row">
                  <div className="input-with-label">
                    <span className="tiny-label" style={{ color: labelColor }}>EXPIRACIÓN</span>
                    <input type="text" name="expiry" value={cardData.expiry} onChange={handleCardChange} placeholder="MM / YY" className="karol-g-input-field" maxLength={5} />
                  </div>
                  
                  <div className="input-with-label cvv-container">
                    <span className="tiny-label" style={{ color: labelColor }}>CVV</span>
                    <div className="cvv-input-wrapper">
                      <input 
                        type={showCvv ? "text" : "password"} 
                        name="cvv" 
                        value={cardData.cvv} 
                        onChange={handleCardChange} 
                        placeholder="***" 
                        className="karol-g-input-field cvv-input" 
                        maxLength={3} 
                      />
                      <button 
                        type="button" 
                        className="cvv-toggle-btn"
                        onClick={() => setShowCvv(!showCvv)}
                      >
                        <Icon name={showCvv ? "eyeOff" : "eye"} size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                  <div className="remember-card-field">
                  <label 
                    className="remember-card-option" 
                    onClick={() => setRememberCard(!rememberCard)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={`custom-checkbox ${rememberCard ? 'checked' : ''}`}>
                      {rememberCard && (
                        <Icon 
                          name="check" 
                          size={14} 
                          stroke="#000" 
                          strokeWidth={4} 
                        />
                      )}
                    </div>
                    <span className="tiny-label">RECORDAR TARJETA EN LAIKA VAULT</span>
                  </label>
                </div>
              </div>
            )}

            <div className="karol-g-secure-footer">
              <Icon name="lock" size={12} style={{ color: textColor }} />
              <span style={{ color: textColor }}>[ PAGO ENCRIPTADO TIER-1 ]</span>
            </div>

            <button
              className="karol-g-pay-btn"
              onClick={() => confirmDirectPayment(paymentMethod)}
              disabled={isProcessingPayment}
            >
              <Icon name="zap" size={18} />
              CONFIRMAR PAGO
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="karol-g-modal-overlay" onClick={() => !isProcessingPayment && !isPaymentApproved && onClose()}>
      <div className="karol-g-glass-panel purchase-main-panel" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
        {renderContent()}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MODAL DE ÉXITO (Pago Completado)
───────────────────────────────────────────── */
export const SuccessModal = ({ isOpen }) => {
  // Ya no se usa Modal exterior. 
  // La vista de éxito está integrada en TicketPrinterOverlay.
  return null;
};
