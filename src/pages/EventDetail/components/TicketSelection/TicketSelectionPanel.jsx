import React from 'react';
import { Badge, Icon } from "../../../../components";
import { formatDate, formatTime, getSeatLabel } from "../../utils/helpers";
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

  // Group functions by date
  const uniqueDates = React.useMemo(() => {
    if (!event?.functions) return [];
    const dates = event.functions.map(f => f.date);
    return Array.from(new Set(dates)).sort();
  }, [event?.functions]);

  const selectedDate = selectedFunction?.date || uniqueDates[0] || null;

  const functionsForSelectedDate = React.useMemo(() => {
    if (!event?.functions || !selectedDate) return [];
    return event.functions.filter(f => f.date === selectedDate);
  }, [event?.functions, selectedDate]);

  return (
    <div className="ticket-selection-panel">

      {/* ── Selector de Fecha/Función ── */}
      {hasFunctions && (
        <div className="tsp-header" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div>
            <p className="tsp-section-label">Selecciona el día</p>
            <div className="function-chips">
              {uniqueDates.map(d => (
                <div
                  key={d}
                  className={`function-chip ${selectedDate === d ? 'active' : ''}`}
                  onClick={() => {
                    const firstFuncForDate = event.functions.find(f => f.date === d);
                    if (firstFuncForDate) {
                      setSelectedFunction(firstFuncForDate);
                    }
                  }}
                >
                  {formatDate(d)}
                </div>
              ))}
            </div>
          </div>

          {functionsForSelectedDate.length > 0 && (
            <div>
              <p className="tsp-section-label">Selecciona el horario y lugar</p>
              <div className="function-chips" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
                {functionsForSelectedDate.map(f => (
                  <div
                    key={f.id}
                    className={`function-chip ${selectedFunction?.id === f.id ? 'active' : ''}`}
                    onClick={() => setSelectedFunction(f)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '8px 12px',
                      width: '100%',
                      textTransform: 'none',
                      letterSpacing: 'normal'
                    }}
                  >
                    <span style={{ fontWeight: 800, fontSize: '0.75rem' }}>{formatTime(f.time)} HRS</span>
                    <span style={{ fontSize: '0.62rem', opacity: 0.8, marginTop: '2px', textAlign: 'left' }}>
                      {f.venue_name || 'Recinto'} — {f.room_name || 'Sala'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                {`$${cleanPrice(section.price)}`} <span className="each">c/u</span>
              </div>
            </div>

            {/* Radio visual */}
            <div className={`mock-radio ${selectedSection?.id === section.id ? 'checked' : ''}`} />
          </div>
        ))}
      </div>


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
                    const label = getSeatLabel(s, event);
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
              <div className="qty-buttons">
                <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>−</button>
                <span className="qty-value">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity(Math.min(20, quantity + 1))} disabled={quantity >= 20}>+</button>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="total-preview">
            <span className="total-label">Total estimado</span>
            <span className="total-amount">{`$${total}`}</span>
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
              <span>
                {isSeating && selectedSeats.length > 0
                  ? `Pagar ${selectedSeats.length} Asiento${selectedSeats.length > 1 ? 's' : ''}`
                  : 'Pagar Directo'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}