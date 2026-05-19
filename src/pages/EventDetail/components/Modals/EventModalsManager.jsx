import React from 'react';
import { Button, Icon } from "../../../../components";
import { getImageUrl } from "../../../../utils/imageUtils";
import TicketPrinterOverlay from "../../../user/UserCart/TicketPrinterOverlay";
import { getSeatLabel } from "../../utils/helpers";

export default function EventModalsManager({
  // Probabilities Modal
  showProbModal,
  setShowProbModal,
  // Roulette Modal
  showRoulettePayment,
  setShowRoulettePayment,
  isProcessingPayment,
  paymentMethod,
  setPaymentMethod,
  cardData,
  handleCardChange,
  confirmRoulettePayment,
  // Direct Purchase Modal
  showDirectPayment,
  setShowDirectPayment,
  directTicketData,
  selectedSection,
  confirmDirectPayment,
  // Success Glow Ticket
  showSuccessTicket,
  setShowSuccessTicket,
  customTicketDesign,
  event,
  displayDate,
  displayTime,
  cleanPrice,
  formatDate,
  formatTime,
  navigate,
  // Winner Modal
  showWinnerModal,
  winningSeatInfo,
  luckyConfig,
  setShowWinnerModal,
  setWinningSeatId,
  // Printer
  showPrinter,
  setShowPrinter,
  printingData,
  isPrinterProcessing,
  setIsPrinterProcessing
}) {
  return (
    <>
      {/* MODAL DE PROBABILIDADES */}
      {showProbModal && (
        <div
          className="laika-modal-overlay"
          onClick={() => setShowProbModal(false)}
        >
          <div
            className="laika-data-sheet prob-modal-glass"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="data-sheet-header">
              <h3>[ LAIKA UNIT ASSIGNMENT - PROBABILITIES ]</h3>
              <button
                className="close-btn"
                onClick={() => setShowProbModal(false)}
              >
                ×
              </button>
            </div>
            <div className="data-sheet-content">
              <div className="prob-row vip">
                <span className="label">
                  NIVEL S (VIP/PLATINO):
                </span>
                <span className="value">15.0%</span>
                <div className="prob-bar">
                  <div
                    className="fill"
                    style={{ width: "15%" }}
                  ></div>
                </div>
              </div>
              <div className="prob-row gold">
                <span className="label">NIVEL A (ZONA ORO):</span>
                <span className="value">25.0%</span>
                <div className="prob-bar">
                  <div
                    className="fill"
                    style={{ width: "25%" }}
                  ></div>
                </div>
              </div>
              <div className="prob-row general">
                <span className="label">
                  NIVEL B (GENERAL):
                </span>
                <span className="value">60.0%</span>
                <div className="prob-bar">
                  <div
                    className="fill"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="data-sheet-footer">
              <p>* COSTO FIJO POR ASIGNACIÓN: $400.00 MXN</p>
              <p>
                * EL SISTEMA BUSCA AUTOMÁTICAMENTE EL MEJOR LUGAR
                DISPONIBLE EN EL NIVEL ASIGNADO.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PAGO PARA LA RULETA */}
      {showRoulettePayment && (
        <div
          className="laika-modal-overlay"
          onClick={() =>
            !isProcessingPayment && setShowRoulettePayment(false)
          }
        >
          <div
            className={`laika-data-sheet payment-roulette-modal ${isProcessingPayment ? "processing" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            {isProcessingPayment ? (
              <div className="payment-loading-state">
                <div className="spinner-gold-container">
                  <div className="spinner-gold-outer"></div>
                  <div className="spinner-gold-inner"></div>
                  <Icon
                    name="zap"
                    size={32}
                    className="zap-icon-pulse"
                  />
                </div>
                <h3
                  className="glitch-text"
                  data-text="[ VALIDANDO ENERGÍA LAIKA ]"
                >
                  [ VALIDANDO ENERGÍA LAIKA ]
                </h3>
                <p className="loading-subtext">
                  Sincronizando con la red de asignación de
                  asientos... No interrumpas el flujo.
                </p>
              </div>
            ) : (
              <>
                <div className="data-sheet-header">
                  <div className="header-badge">PREMIUM ACCESS</div>
                  <h3>[ LUCKY SEAT VAULT ]</h3>
                  <button
                    className="close-btn"
                    onClick={() => setShowRoulettePayment(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="data-sheet-content payment-horizontal-layout">
                  {/* COLUMNA IZQUIERDA: RESUMEN DE PRECIO */}
                  <div className="payment-col left-col">
                    <div className="price-tag-container">
                      <span className="price-label">COSTO DE ENTRADA</span>
                      <h2 className="price-value">$400.00</h2>
                      <span className="price-currency">MXN</span>
                    </div>
                    <div className="payment-security-labels">
                      <div className="security-item">
                        <Icon name="lock" size={12} />
                        <span>PAGO ENCRIPTADO 256-BIT</span>
                      </div>
                    </div>
                  </div>

                  {/* COLUMNA DERECHA: MÉTODOS Y ACCIÓN */}
                  <div className="payment-col right-col">
                    <h4 className="step-title">¿CÓMO QUIERES PAGAR?</h4>
                    
                    <div className="method-list">
                      <div 
                          className={`method-card ${paymentMethod === 'card' ? 'active' : ''}`}
                          onClick={() => setPaymentMethod('card')}
                      >
                          <div className="radio-circle"></div>
                          <div style={{ flex: 1 }}>
                              <span className="method-label">Tarjeta crédito / débito</span>
                              <div className="card-icons">
                                    <svg width="20" height="12" viewBox="0 0 30 20"><rect width="30" height="20" rx="3" fill="#1A1F71"/><path d="M11 13l1-5h2l-1 5h-2zm7-5c-.6 0-1 .2-1.3.6l-.2-.5h-1.6l1.2 5h1.8l.2-1.3h2l.1 1.3h1.8l-.8-5h-1.3zm.2 1.3h-.7l.2 1.3h.6l-.1-1.3z" fill="white"/></svg>
                                    <svg width="20" height="12" viewBox="0 0 30 20"><rect width="30" height="20" rx="3" fill="#EB001B"/><circle cx="12" cy="10" r="7" fill="#EB001B"/><circle cx="18" cy="10" r="7" fill="#F79E1B" fillOpacity="0.8"/></svg>
                              </div>
                          </div>
                      </div>

                      {paymentMethod === 'card' && (
                          <div className="card-form-compact">
                              <input type="text" name="number" value={cardData.number} onChange={handleCardChange} placeholder="NÚMERO DE TARJETA" maxLength="16" />
                              <div className="form-row-compact">
                                  <input type="text" name="expiry" value={cardData.expiry} onChange={handleCardChange} placeholder="MM/YY" maxLength="5" />
                                  <input type="password" name="cvv" value={cardData.cvv} onChange={handleCardChange} placeholder="CVV" maxLength="3" />
                              </div>
                          </div>
                      )}

                      <div 
                          className={`method-card ${paymentMethod === 'oxxo' ? 'active' : ''}`}
                          onClick={() => setPaymentMethod('oxxo')}
                      >
                          <div className="radio-circle"></div>
                          <div style={{ flex: 1 }}>
                              <span className="method-label">Efectivo Oxxo</span>
                          </div>
                          <div className="oxxo-badge">OXXO PAY</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={() => confirmRoulettePayment(paymentMethod)}
                        disabled={isProcessingPayment}
                        className="pay-vault-confirm-btn"
                      >
                        {isProcessingPayment ? 'PROCESANDO...' : 'CONFIRMAR PAGO'}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE COMPRA DIRECTA DE BOLETOS FAST-CHECKOUT */}
      {showDirectPayment && directTicketData && (
        <div
          className="laika-modal-overlay"
          onClick={() => !isProcessingPayment && setShowDirectPayment(false)}
        >
          <div
            className={'laika-data-sheet payment-roulette-modal ' + (isProcessingPayment ? 'processing' : '')}
            onClick={(e) => e.stopPropagation()}
          >
            {isProcessingPayment ? (
              <div className="payment-loading-state">
                <div className="spinner-gold-container">
                  <div className="spinner-gold-outer"></div>
                  <div className="spinner-gold-inner"></div>
                  <Icon name="zap" size={32} className="zap-icon-pulse" />
                </div>
                <h3 className="glitch-text" data-text="[ PROCESANDO ORDEN ]">[ PROCESANDO ORDEN ]</h3>
                <p className="loading-subtext">Reservando tus asientos en la red de Laika...</p>
              </div>
            ) : (
              <>
                <div className="data-sheet-header">
                  <div className="header-badge">TICKET DIRECT ACCESS</div>
                  <h3>[ COMPRA DE BOLETOS ]</h3>
                  <button className="close-btn" onClick={() => setShowDirectPayment(false)}>×</button>
                </div>
                <div className="data-sheet-content payment-horizontal-layout">
                  <div className="payment-col left-col">
                    <div className="price-tag-container">
                      <span className="price-label">TOTAL A PAGAR</span>
                      <h2 className="price-value">${(cleanPrice(directTicketData?.section?.price || selectedSection?.price || 0) * (directTicketData?.quantity || 1)).toLocaleString("es-MX", { minimumFractionDigits: 0 })}</h2>
                      <span className="price-currency">MXN</span>
                    </div>
                    <div className="payment-security-labels" style={{ marginTop: '1rem' }}>
                      <div style={{ fontSize: '0.65rem', color: '#888', background: '#111', padding: '10px', borderRadius: '8px' }}>
                        <div style={{ fontWeight: 800 }}>RESUMEN:</div>
                        <div>Evento: {directTicketData?.event?.name}</div>
                        <div>Sección: {directTicketData?.section?.name || "General"}</div>
                        <div>Asiento(s): {directTicketData?.seats?.length > 0 ? directTicketData.seats.map(s => getSeatLabel(s, event)).join(', ') : "General (Sin número)"}</div>
                        <div>Cantidad: {directTicketData?.quantity} ticket(s)</div>
                      </div>
                    </div>
                  </div>

                  <div className="payment-col right-col">
                    <h4 className="step-title">¿CÓMO QUIERES PAGAR?</h4>
                    <div className="method-list">
                      <div className={'method-card ' + (paymentMethod === 'card' ? 'active' : '')} onClick={() => setPaymentMethod('card')}>
                        <div className="radio-circle"></div>
                        <div style={{ flex: 1 }}>
                          <span className="method-label">Tarjeta crédito / débito</span>
                        </div>
                      </div>
                      {paymentMethod === 'card' && (
                        <div className="card-form-compact">
                          <input type="text" name="number" value={cardData.number} onChange={handleCardChange} placeholder="NÚMERO DE TARJETA" maxLength="16" />
                          <div className="form-row-compact">
                            <input type="text" name="expiry" value={cardData.expiry} onChange={handleCardChange} placeholder="MM/YY" maxLength="5" />
                            <input type="password" name="cvv" value={cardData.cvv} onChange={handleCardChange} placeholder="CVV" maxLength="3" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <Button variant="primary" fullWidth onClick={() => confirmDirectPayment(paymentMethod)} disabled={isProcessingPayment}>
                        {isProcessingPayment ? 'PROCESANDO...' : 'PAGAR BOLETO'}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ANIMACIÓN PREMIUM GLOW TICKET (COMPRA EXITOSA) */}
      {showSuccessTicket && (
        <div className="laika-modal-overlay success-glow-overlay" onClick={() => setShowSuccessTicket(false)}>
          <div className="ticket-glowing-showcase" onClick={e => e.stopPropagation()}>
            <div className="success-banner">¡TRANSACCIÓN EXITOSA!</div>
            {customTicketDesign ? (
              <div style={{ position: 'relative', width: `${customTicketDesign.canvasSize.w}px`, height: `${customTicketDesign.canvasSize.h}px`, backgroundColor: '#FFFFFF', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', maxWidth: '90vw' }}>
                <div className="glow-border"></div>
                {customTicketDesign.elements.map(el => {
                  const style = {
                    position: 'absolute',
                    left: `${el.x}px`, top: `${el.y}px`,
                    fontFamily: el.fontFamily || 'inherit',
                    fontWeight: el.fontWeight || 'normal',
                    cursor: 'default',
                    userSelect: 'none'
                  };

                  if (el.type === 'rect') {
                    return <div key={el.id} style={{ ...style, width: `${el.w}px`, height: `${el.h}px`, background: el.color }} />
                  }
                  if (el.type === 'dashed-line') {
                    return <div key={el.id} style={{ ...style, width: `${el.w}px`, height: `${el.h}px`, borderLeft: `${el.w}px dashed ${el.color}` }} />
                  }
                  if (el.type === 'text') {
                    let text = el.text;
                    if (text.includes("TÍTULO DEL EVENTO")) text = event.name;
                    if (text.includes("FECHA")) text = `FECHA: ${formatDate(displayDate)}`;
                    if (text.includes("HORA")) text = `HORA: ${formatTime(displayTime)} hrs`;
                    if (text.includes("$0.00")) text = `$${(directTicketData?.total || 1500).toLocaleString()}`;
                    if (text.includes("TALÓN")) text = `TALÓN CONTROL`;
                    
                    return <div key={el.id} style={{ ...style, fontSize: `${el.fontSize}px`, color: el.color, whiteSpace: 'pre-line' }}>{text}</div>
                  }
                  if (el.type === 'uploaded-image') {
                    return <div key={el.id} style={{ ...style }}><img src={el.src} style={{ width: `${el.w}px`, height: `${el.h}px`, objectFit: 'cover' }} alt="ticket-img" /></div>
                  }
                  if (el.type === 'barcode') {
                    return <div key={el.id} style={{ ...style, width: `${el.w}px`, height: `${el.h}px`, background: 'linear-gradient(to right, #000 5%, #fff 5%, #000 15%)', backgroundSize: '8px 100%' }} />
                  }
                  return null;
                })}
              </div>
            ) : (
              <div className="ticket-card-animated">
                <div className="glow-border"></div>
                <div className="ticket-content">
                  <div className="ticket-header">
                    <span className="badge-digital">DIGITAL PASS</span>
                    <h3>{directTicketData?.event?.name || event.name}</h3>
                  </div>
                  <div className="ticket-body">
                    <div className="row">
                      <span>SECCIÓN</span>
                      <strong style={{ color: '#EAB308' }}>{directTicketData?.section?.name || "General"}</strong>
                    </div>
                    <div className="row">
                      <span>ASIENTO</span>
                      <strong>{directTicketData?.seats?.length > 0 ? directTicketData.seats.map(s => getSeatLabel(s, event)).join(', ') : "General"}</strong>
                    </div>
                  </div>
                  <div className="ticket-footer">
                    <div className="qr-box-animated">
                      <Icon name="qrCode" size={100} color="#fff" />
                    </div>
                    <span className="scan-text">ESCANEAR ACCESO</span>
                  </div>
                </div>
              </div>
            )}
            <Button variant="primary" className="mt-4" onClick={() => { setShowSuccessTicket(false); navigate('/profile'); }}>IR A MIS BOLETOS</Button>
          </div>
        </div>
      )}

      {/* MODAL DE GANADOR LUCY SEAT (PANTALLA FINAL DRAMÁTICA) */}
      {showWinnerModal && winningSeatInfo && (
        <div className="laika-modal-overlay">
          <div className="winner-announce-modal winner-horizontal-layout glass-card">
            <div className="winner-sparkles left"></div>
            <div className="winner-sparkles right"></div>

            {/* COLUMNA IZQUIERDA: MENSAJE DE ÉXITO */}
            <div className="layout-col left-col">
              <div className="status-label">ASIGNACIÓN EXITOSA</div>
              <h1 className="congrats-text">¡FELICIDADES!</h1>
              <p className="winner-subtext">
                EL SISTEMA HA SELECCIONADO TU LUGAR PRIVILEGIADO
              </p>
            </div>

            {/* COLUMNA CENTRAL: EL BOLETO HERO */}
            <div className="layout-col center-col hero-ticket-container">
              <div className="winner-card-visual">
                {(() => {
                  const zone = winningSeatInfo.zoneName.toUpperCase();
                  let themeClass = "golden-ticket-card";
                  let themeColor = "#EAB308"; // Default
                  if (zone.includes("BRONCE")) { themeClass += " bronze-theme"; themeColor = luckyConfig.themes.bronze; }
                  else if (zone.includes("PLATA")) { themeClass += " silver-theme"; themeColor = luckyConfig.themes.silver; }
                  else if (zone.includes("PLATINO")) { themeClass += " platinum-theme"; themeColor = luckyConfig.themes.platinum; }
                  else if (zone.includes("ORO")) { themeClass += " gold-theme"; themeColor = luckyConfig.themes.gold; }
                  
                  return (
                    <div className={themeClass} style={{ borderColor: themeColor }}>
                      <div className="golden-glow" style={{ background: `radial-gradient(circle, ${themeColor}22 0%, transparent 70%)` }}></div>
                      <div className="ticket-header">
                        <div className="ticket-title-row" style={{ color: themeColor }}>
                          <Icon name="sparkles" size={16} />
                          <span>LAIKA LUCKY SEAT</span>
                          <Icon name="sparkles" size={16} />
                        </div>
                      </div>
                      <div className="ticket-body">
                        <div className="seat-circle-large" style={{ borderColor: `${themeColor}44`, background: `radial-gradient(circle, ${themeColor}11 0%, transparent 80%)` }}>
                          <div className="seat-label-top">ASIENTO</div>
                          <span className="seat-number" style={{ color: themeColor }}>
                            {winningSeatInfo.name}
                          </span>
                        </div>
                      </div>
                      <div className="ticket-footer">
                        <div className="barcode-container">
                          <div className="barcode-mock" style={{ opacity: 0.5 }}></div>
                          <span className="barcode-num">
                            L-LK-{winningSeatInfo.id.toUpperCase().split('-').pop()}-{Math.floor(1000 + Math.random() * 9000)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* COLUMNA DERECHA: INFO Y ACCIÓN */}
            <div className="layout-col right-col">
              <div className="winner-details-panel">
                <div className="detail-item">
                  <span className="dl">ZONA:</span>
                  <span className="dv">{winningSeatInfo.zoneName}</span>
                </div>
                <div className="detail-item highlight">
                  <span className="dl">VALOR COMERCIAL:</span>
                  <span className="dv">
                    ${winningSeatInfo.price?.toLocaleString() || "1,200"} MXN
                  </span>
                </div>
                <div className="detail-item">
                  <span className="dl">TÚ PAGASTE:</span>
                  <span className="dv">$400 MXN</span>
                </div>
              </div>
              <Button
                variant="primary"
                fullWidth
                size="large"
                className="mt-4 accept-seat-btn"
                onClick={() => {
                  setShowWinnerModal(false);
                  setWinningSeatId(null);
                  navigate('/profile');
                }}
              >
                ACEPTAR Y VER BOLETO
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TICKET PRINTER OVERLAY */}
      {showPrinter && (
         <TicketPrinterOverlay
             isOpen={showPrinter}
             ticketData={printingData}
             isProcessing={isPrinterProcessing}
             onComplete={() => {
               setShowPrinter(false);
               setShowSuccessTicket(false);
               navigate('/user/tickets');
             }}
         />
      )}
    </>
  );
}
