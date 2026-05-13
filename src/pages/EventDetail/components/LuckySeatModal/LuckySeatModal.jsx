import React, { useState } from "react";
import { Icon } from "../../../../components";
import { useTheme } from "../../../../context/ThemeContext";
import PremiumTicketReveal from "../PurchaseModal/PremiumTicketReveal";
import "./LuckySeatModal.css";

/* ─────────────────────────────────────────────
   MODAL DE PROBABILIDADES (Info de la ruleta)
───────────────────────────────────────────── */
export const ProbabilityModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="karol-g-modal-overlay" onClick={onClose}>
      <div
        className="karol-g-glass-panel prob-modal-glass glass-card"
        style={{ maxWidth: '460px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="karol-g-modal-header">
          <h3>[ LAIKA UNIT ASSIGNMENT / PROBABILITIES ]</h3>
          <button className="karol-g-close-btn" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="data-sheet-content" style={{ padding: '2.5rem' }}>
          <div className="prob-row vip">
            <span className="label">NIVEL S (VIP/PLATINO):</span>
            <span className="value">15.0%</span>
            <div className="prob-bar"><div className="fill" style={{ width: "15%" }}></div></div>
          </div>
          <div className="prob-row gold">
            <span className="label">NIVEL A (ZONA ORO):</span>
            <span className="value">25.0%</span>
            <div className="prob-bar"><div className="fill" style={{ width: "25%" }}></div></div>
          </div>
          <div className="prob-row general">
            <span className="label">NIVEL B (GENERAL):</span>
            <span className="value">60.0%</span>
            <div className="prob-bar"><div className="fill" style={{ width: "60%" }}></div></div>
          </div>
        </div>
        <div className="data-sheet-footer">
          <p>* COSTO FIJO POR ASIGNACIÓN: $400.00 MXN</p>
          <p>* EL SISTEMA BUSCA AUTOMÁTICAMENTE EL MEJOR LUGAR DISPONIBLE EN EL NIVEL ASIGNADO.</p>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MODAL DE PAGO RULETA (Lucky Seat Roulette)
───────────────────────────────────────────── */
export const LuckySeatPaymentModal = ({
  isOpen, onClose, isProcessingPayment, isPaymentApproved,
  event, displayDate, displayTime,
  paymentMethod, setPaymentMethod,
  cardData, handleCardChange, getFormattedNumber,
  confirmRoulettePayment,
}) => {
  const [showCvv, setShowCvv] = useState(false);
  const { isDark } = useTheme();
  
  if (!isOpen) return null;

  const textColor = isDark ? '#fff' : '#000';
  const labelColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.6)';
  const glassBg = isDark ? 'rgba(0, 0, 0, 0.4)' : '#fff';
  const borderCol = isDark ? 'rgba(255, 255, 255, 0.1)' : '#000';

  const renderContent = () => {
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
          <p className="success-msg-technical" style={{ color: labelColor }}>[ INICIANDO ESCANEO DE ASIENTO ]</p>
        </div>
      );
    }

    if (isProcessingPayment) {
      return (
        <div className="payment-status-view validating-view industrial-glow-frame">
          <div className="scan-line-effect"></div>
          <div className="industrial-loader">
            <div className="loader-ring"></div>
            <div className="loader-ring" style={{ animationDelay: '-0.5s' }}></div>
            <Icon name="shieldCheck" size={48} className="shield-pulse" />
          </div>
          <h3 className="technical-text" data-text="[ SISTEMA: VALIDANDO COMPRA ]">[ SISTEMA: VALIDANDO COMPRA ]</h3>
          <p className="validation-sub">[ ENCRIPTACIÓN TIER-1 ACTIVA ]</p>
          <div className="telemetry-bar-mini">
             <div className="bar-fill-loading"></div>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="karol-g-modal-header" style={{ borderBottomColor: borderCol }}>
          <h3 style={{ color: textColor }}>[ LUCKY SEAT ROULETTE ]</h3>
          <button className="karol-g-close-btn" onClick={onClose} aria-label="Cerrar" style={{ color: labelColor }}>×</button>
        </div>

        <div className="karol-g-payment-layout">
          <div className="karol-g-info-col kg-roulette-info-col">
            <div className="kg-roulette-texture" style={{ opacity: isDark ? 0.25 : 0.05 }}></div>
            <div className="karol-g-event-card" style={{ borderColor: borderCol }}>
              <img src={event?.image_url} alt="" />
              <div className="karol-g-event-overlay">
                <h2 style={{ color: '#fff' }}>{event?.name}</h2>
                <div className="meta" style={{ color: isDark ? '#E5E4E2' : '#fff' }}>
                  {new Date(displayDate).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })} • {displayTime} HRS
                </div>
              </div>
            </div>
            <div className="karol-g-price-card" style={{ background: glassBg, borderColor: borderCol }}>
              <div className="subtotal" style={{ color: labelColor }}>COSTO DE ENTRADA</div>
              <div className="total" style={{ color: textColor }}>$1,250.00 MXN</div>
            </div>
          </div>

          <div className="karol-g-form-col">
            <h4 className="purchase-form-title" style={{ color: labelColor }}>VALIDACIÓN DE DEPÓSITO</h4>
            
            <div className={'karol-g-method-selector ' + (paymentMethod === 'card' ? 'active' : '')} 
                 onClick={() => setPaymentMethod('card')}
                 style={{ background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#fff', borderColor: borderCol }}>
              <div className="purchase-radio-dot" style={{ background: paymentMethod === 'card' ? textColor : 'transparent', borderColor: textColor }}></div>
              <div className="purchase-card-brands">
                <img src="https://img.icons8.com/color/48/visa.png" style={{ height: '18px' }} alt="Visa" />
                <img src="https://img.icons8.com/color/48/mastercard.png" style={{ height: '18px' }} alt="Mastercard" />
              </div>
              <span className="purchase-method-label" style={{ color: textColor }}>TARJETA CRÉDITO / DÉBITO</span>
            </div>

            {paymentMethod === 'card' && (
              <div className="purchase-card-fields animate-in slide-in-from-top-4 duration-500">
                <div className="input-with-label">
                  <span className="tiny-label" style={{ color: labelColor }}>NÚMERO DE TARJETA</span>
                  <input 
                    type="text" 
                    name="number" 
                    value={getFormattedNumber(cardData.number)} 
                    onChange={handleCardChange} 
                    placeholder="**** **** **** ****" 
                    className="karol-g-input-field" 
                    maxLength={19} 
                    autoComplete="off"
                    style={{ background: glassBg, color: textColor, borderColor: borderCol }}
                  />
                </div>
                
                <div className="purchase-card-row">
                  <div className="input-with-label">
                    <span className="tiny-label" style={{ color: labelColor }}>EXPIRACIÓN</span>
                    <input 
                      type="text" 
                      name="expiry" 
                      value={cardData.expiry} 
                      onChange={handleCardChange} 
                      placeholder="MM / YY" 
                      className="karol-g-input-field" 
                      maxLength={5} 
                      autoComplete="off" 
                      style={{ background: glassBg, color: textColor, borderColor: borderCol }}
                    />
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
                        className="karol-g-input-field" 
                        maxLength={4} 
                        autoComplete="off" 
                        style={{ background: glassBg, color: textColor, borderColor: borderCol }}
                      />
                      <button 
                        type="button" 
                        className="cvv-toggle-btn"
                        onClick={() => setShowCvv(!showCvv)}
                        style={{ color: labelColor }}
                      >
                        <Icon name={showCvv ? "eyeOff" : "eye"} size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="karol-g-secure-footer" style={{ borderTopColor: borderCol }}>
              <Icon name="lock" size={12} style={{ color: textColor }} />
              <span style={{ color: textColor }}>[ PAGO ENCRIPTADO TIER-1 ]</span>
            </div>

            <button 
              className="karol-g-pay-btn kg-btn-gold-glow" 
              onClick={() => confirmRoulettePayment(paymentMethod)} 
              disabled={isProcessingPayment}
              style={{ background: isDark ? '#E5E4E2' : '#000', color: isDark ? '#000' : '#fff' }}
            >
              PAGAR Y GIRAR
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="karol-g-modal-overlay" onClick={() => !isProcessingPayment && !isPaymentApproved && onClose()}>
      <div className="karol-g-glass-panel" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
        {renderContent()}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MODAL DE GANADOR (Winner Announcement)
───────────────────────────────────────────── */
export const WinnerModal = ({ isOpen, winningSeatInfo, luckyConfig, onClose, success, navigate }) => {
  if (!isOpen || !winningSeatInfo) return null;

  const zone = winningSeatInfo.zoneName.toUpperCase();
  let themeClass = "golden-ticket-card";
  let themeColor = "#EAB308";
  if (zone.includes("BRONCE")) { themeClass += " bronze-theme"; themeColor = luckyConfig.themes.bronze; }
  else if (zone.includes("PLATA")) { themeClass += " silver-theme"; themeColor = luckyConfig.themes.silver; }
  else if (zone.includes("PLATINO")) { themeClass += " platinum-theme"; themeColor = luckyConfig.themes.platinum; }
  else if (zone.includes("ORO")) { themeClass += " gold-theme"; themeColor = luckyConfig.themes.gold; }

  return (
    <div className="karol-g-modal-overlay">
      <div className="karol-g-glass-panel" style={{ maxWidth: '600px', padding: '0' }}>
        <PremiumTicketReveal 
          event={luckyConfig.event}
          ticketData={{
            section: { name: winningSeatInfo.zoneName },
            seatNames: winningSeatInfo.name,
            price: "1,250.00"
          }}
          onClose={onClose}
          navigate={navigate}
        />
      </div>
    </div>
  );
};
