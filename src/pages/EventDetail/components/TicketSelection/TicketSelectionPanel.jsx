import React from 'react';
import { Badge, Icon } from "../../../../components";
import { formatDate, formatTime } from "../../utils/helpers";
import './TicketSelection.css';

export default function TicketSelectionPanel({
  user,
  event,
  hasFunctions,
  selectedFunction,
  setSelectedFunction,
  sortedSections,
  selectedSection,
  setSelectedSection,
  quantity,
  setQuantity,
  selectedSeats,
  cleanPrice,
  handleAddToCart,
  handleDirectBuy,
  handleLuckySeat,
  isRouletteActive,
  setShowProbModal
}) {
  const isSeating = selectedSection?.type === 'seating';
  const seatCount = isSeating ? selectedSeats.length : quantity;
  const unitPrice = cleanPrice(selectedSection?.price || event?.price || 0);
  const total = (seatCount * unitPrice).toFixed(2);

  return (
    <div className="ticket-selection-panel">

      {/* ── Selector de Fecha/Función ── */}
      {hasFunctions && (
        <div className="tsp-header">
          <p className="tsp-section-label">Selecciona la fecha</p>
          <div className="function-chips">
            {event.functions.map(f => (
              <div
                key={f.id}
                className={`function-chip ${selectedFunction?.id === f.id ? 'active' : ''}`}
                onClick={() => setSelectedFunction(f)}
              >
                {formatDate(f.date)} — {formatTime(f.time)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Lista de Secciones ── */}
      <div className="tsp-sections-list">
        {sortedSections.map(section => (
          <div
            key={section.id}
            className={`ticket-option-row ${selectedSection?.id === section.id ? 'selected' : ''}`}
            onClick={() => setSelectedSection(section)}
          >
            {/* Letra inicial de la zona */}
            <div className="ticket-minimap">
              {section.name?.substring(0, 1)?.toUpperCase()}
            </div>

            {/* Info de la sección */}
            <div className="ticket-info">
              <div className="ticket-section-title">
                {section.name}
                {section.type === 'seating' && (
                  <Badge variant="premium" size="sm">Asignado</Badge>
                )}
              </div>
              <div className="ticket-type-desc">
                <span className="dot-indicator" />
                {section.type === 'seating' ? 'Selección en mapa' : 'Entrada General'}
              </div>
              <div className="ticket-price-val">
                ${cleanPrice(section.price)} <span className="each">c/u</span>
              </div>
            </div>

            {/* Radio visual */}
            <div className={`mock-radio ${selectedSection?.id === section.id ? 'checked' : ''}`} />
          </div>
        ))}
      </div>

      {/* ── Lucky Seat ── */}
      {event.has_lucky_seat && (
        <div className="tsp-lucky-block">
          <h4 className="tsp-lucky-title">¡Gana un ascenso! ✨</h4>
          <p className="tsp-lucky-desc">Prueba suerte por un asiento premium por solo $40</p>
          <div className="tsp-lucky-actions">
            <button
              className="back-button prob-btn"
              onClick={() => setShowProbModal(true)}
            >
              Ver probs
            </button>
            <button
              className="lucky-btn-premium-gold"
              onClick={handleLuckySeat}
              disabled={isRouletteActive}
            >
              <Icon name="zap" size={15} />
              {isRouletteActive ? 'Girando...' : 'Jugar Ruleta'}
            </button>
          </div>
        </div>
      )}

      {/* ── Bottom de Compra ── */}
      {selectedSection && (
        <div className="tsp-purchase-bottom">
          {/* Asientos o Cantidad */}
          {isSeating ? (
            <div className="tsp-seats-row">
              <span className="tsp-seats-label">Asientos</span>
              <div className="selected-seats-chips">
                {selectedSeats.length > 0 ? (
                  selectedSeats.map(s => {
                    const parts = s.split('-');
                    const label = parts.length >= 3
                      ? `${parts[parts.length - 2]}${parts[parts.length - 1]}`
                      : parts.pop();
                    return (
                      <Badge key={s} variant="primary" size="sm">{label}</Badge>
                    );
                  })
                ) : (
                  <span className="seats-hint">Selecciona en el mapa ↑</span>
                )}
              </div>
            </div>
          ) : (
            <div className="quantity-selector-compact">
              <label>Cantidad</label>
              <select
                className="laika-select"
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          )}

          {/* Total */}
          <div className="total-preview">
            <span className="total-label">Total estimado</span>
            <span className="total-amount">${total}</span>
          </div>

          {/* Botones de Acción: Carrito y Compra Directa */}
          <div className="tsp-actions-row" style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              className="buy-btn-premium"
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff',
                boxShadow: 'none'
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'; }}
              onClick={handleAddToCart}
              disabled={isSeating ? selectedSeats.length === 0 : false}
            >
              <Icon name="shopping-cart" size={18} />
              Añadir
            </button>

            <button
              className="buy-btn-premium"
              style={{ flex: 1.6 }}
              onClick={handleDirectBuy}
              disabled={isSeating ? selectedSeats.length === 0 : false}
            >
              <Icon name="credit-card" size={18} />
              {isSeating && selectedSeats.length > 0
                ? `Pagar ${selectedSeats.length} Asiento${selectedSeats.length > 1 ? 's' : ''}`
                : 'Pagar Directo'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}