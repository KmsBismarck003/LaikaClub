import React from 'react';
import { Badge, Icon } from "../../../../components";

export default function TicketSelectionPanel({
  user,
  hasFunctions,
  event,
  selectedFunction,
  setSelectedFunction,
  activeTab,
  setActiveTab,
  sortedSections,
  selectedSection,
  setSelectedSection,
  quantity,
  setQuantity,
  selectedSeats,
  cleanPrice,
  handleAddToCart,
  handleRealAddToCart,
  isRouletteActive,
  handleLuckySeat,
  setShowProbModal
}) {
  return (
    <div className="ticket-selection-panel event-purchase-card-glass">
      {/* Banner informativo suave para admins (opcional, no bloquea) */}
      {(user?.role === "admin" || user?.role === "gestor") && (
        <div className="admin-status-banner-soft" style={{ 
          padding: '0.5rem 0.75rem', 
          marginBottom: '0.75rem',
          borderRadius: '12px',
          fontSize: '0.7rem',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.6)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Icon name="shield" size={12} style={{ marginRight: '6px' }} />
          Admin Mode: Testing Active
        </div>
      )}
      {/* Function Selector (if needed) */}
      {hasFunctions && (
        <div className="function-selector-compact">
          <h3 className="section-label-premium">FECHAS DISPONIBLES:</h3>
          <div className="function-chips">
            {event.functions.map((fn) => (
              <button
                key={fn.id}
                onClick={() => setSelectedFunction(fn)}
                className={`function-chip ${selectedFunction?.id === fn.id ? "active" : ""}`}
              >
                {new Date(fn.date).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "short",
                })}{" "}
                • {String(fn.time).substring(0, 5)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="ticket-filters">
        <div className="ticket-tabs">
          <button
            className={`ticket-tab ${activeTab === "lowest" ? "active" : ""}`}
            onClick={() => setActiveTab("lowest")}
          >
            Precio más bajo
          </button>
          <button
            className={`ticket-tab ${activeTab === "best" ? "active" : ""}`}
            onClick={() => setActiveTab("best")}
          >
            Mejores asientos
          </button>
        </div>
        <div className="ticket-results-count">
          <span>Opciones Disponibles</span>
          <Badge variant="primary">
            Quedan {event.available_tickets}
          </Badge>
        </div>
      </div>

      <div className="ticket-options-list" key={activeTab}>
        {sortedSections.map((tier, idx) => (
          <div
            key={tier.id || idx}
            className={`ticket-option-row selectable ${selectedSection?.id === tier.id || (tier.isGeneral && !selectedSection) ? "selected" : ""}`}
            onClick={() => setSelectedSection(tier)}
          >
            <div
              className="ticket-minimap"
              style={
                tier.isGeneral
                  ? {}
                  : { backgroundColor: tier.color_hex || "#e4e4e7" }
              }
            >
              {tier.isGeneral ? "GRAL" : `Z${idx + 1}`}
            </div>
            <div className="ticket-info">
              <div className="ticket-section-title">
                {tier.name}
                {tier.badge_text && (
                  <Badge
                    className={`ticket-badge ${tier.badge_text.toLowerCase().includes("vip") ? "vip" : ""}`}
                  >
                    {tier.badge_text}
                  </Badge>
                )}
                
                {/* INDICADOR DE ASIENTO SELECCIONADO */}
                {selectedSeats.length > 0 && selectedSeats.some(s => String(s).split('-')[0] === String(tier.id)) && (
                  <div className="selected-seat-indicator animate-in fade-in slide-in-from-left-2">
                    <Icon name="check" size={10} className="mr-1" style={{ marginRight: '4px' }} />
                    {selectedSeats.find(s => String(s).split('-')[0] === String(tier.id)).split('-')[1]}
                  </div>
                )}
              </div>
              <div className="ticket-type-desc">
                Disp: {tier.available} • <span className="ticket-price-val">${Number(tier.price).toLocaleString("es-MX")}</span>
              </div>
            </div>
            <div className="ticket-action">
              <div
                className={`mock-radio ${selectedSection?.id === tier.id || (tier.isGeneral && !selectedSection) ? "checked" : ""}`}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="purchase-sticky-bottom">
        <div className="purchase-controls-master">
          <div className="quantity-pill-technical">
            <button 
              className="qty-btn-glass"
              onClick={() => setQuantity(q => Math.max(1, q - 1))} 
              disabled={selectedSeats.length > 0}
            >−</button>
            <span className="qty-val-technical">{quantity}</span>
            <button 
              className="qty-btn-glass"
              onClick={() => setQuantity(q => Math.min(10, q + 1))} 
              disabled={selectedSeats.length > 0}
            >+</button>
          </div>

          <div className="total-technical-hud">
            <label>
              {selectedSeats.length > 0 
                ? `ASIENTO ${selectedSeats[0].split('-')[1]} • TOTAL` 
                : 'TOTAL ESTIMADO'
              }
            </label>
            <span>
              $
              {(
                (selectedSection
                  ? cleanPrice(selectedSection.price)
                  : cleanPrice(event.price || 0)) *
                (selectedSeats.length > 0
                  ? selectedSeats.length
                  : quantity)
              ).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <button
            className="btn-purchase-glass-capsule"
            onClick={handleAddToCart}
            disabled={(event && event.available_tickets === 0) || (!selectedSection && selectedSeats.length === 0)}
            style={{ flex: 1 }}
          >
            COMPRA DIRECTA
          </button>
          
          <button
            className="btn-purchase-glass-capsule"
            onClick={handleRealAddToCart}
            disabled={(event && event.available_tickets === 0) || (!selectedSection && selectedSeats.length === 0)}
            style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            <Icon name="shoppingCart" size={14} style={{ marginRight: '6px' }} />
            AÑADIR A CARRITO
          </button>
        </div>

        <div className="lucky-action-container" style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn-lucky-glass-capsule ${isRouletteActive ? "active" : ""}`}
            onClick={handleLuckySeat}
            disabled={event.available_tickets === 0 || isRouletteActive}
          >
              <Icon name="sparkles" size={14} style={{ marginRight: '8px' }} />
            {isRouletteActive ? "[ SCANNING... ]" : "LUCKY SEAT [ $400 ]"}
            {isRouletteActive && <span className="scan-line"></span>}
          </button>
          <button
            className="prob-info-btn"
            onClick={() => setShowProbModal(true)}
            style={{ 
              width: '48px', 
              height: '48px', 
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontWeight: 900,
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            ?
          </button>
        </div>
      </div>
    </div>
  );
}
