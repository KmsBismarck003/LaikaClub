import React from 'react';
import { Badge, Button, Icon } from "../../../../components";

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
  handleLuckySeat,
  isRouletteActive,
  setShowProbModal
}) {
  return (
    <div className="ticket-selection-panel">
      <div className="panel-body">
        {/* Function Selection */}
        {hasFunctions && (
          <div className="function-selector-compact">
            <h3>Selecciona la fecha</h3>
            <div className="function-chips">
              {event.functions.map(f => (
                <div 
                  key={f.id} 
                  className={`function-chip ${selectedFunction?.id === f.id ? 'active' : ''}`}
                  onClick={() => setSelectedFunction(f)}
                >
                  {f.date} - {f.time}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sections List */}
        <div className="ticket-options-list" style={{ maxHeight: '400px' }}>
          {sortedSections.map(section => (
            <div 
              key={section.id} 
              className={`ticket-option-row ${selectedSection?.id === section.id ? 'selected' : ''}`}
              onClick={() => setSelectedSection(section)}
            >
              <div className="ticket-minimap">
                {section.name.substring(0, 1)}
              </div>
              <div className="ticket-info">
                <div className="ticket-section-title">
                  {section.name}
                  {section.type === 'seating' && <Badge variant="premium" size="sm">ASIGNADO</Badge>}
                </div>
                <div className="ticket-type-desc">
                  <span className="dot-indicator"></span>
                  {section.type === 'seating' ? 'Selección en mapa' : 'Entrada General'}
                </div>
                <div className="ticket-price-val">
                  ${cleanPrice(section.price)} <span className="each">c/u</span>
                </div>
              </div>
              <div className={`mock-radio ${selectedSection?.id === section.id ? 'checked' : ''}`}></div>
            </div>
          ))}
        </div>

        {selectedSection && (
          <div className="purchase-sticky-bottom">
            {selectedSection.type === 'seating' ? (
              <div className="quantity-selector-compact">
                <label>Asientos seleccionados</label>
                <div className="selected-seats-chips">
                  {selectedSeats.length > 0 ? (
                    selectedSeats.map(s => {
                      // Mostrar etiqueta legible: "A-1", "B-3", etc.
                      const parts = s.split('-');
                      const label = parts.length >= 3
                        ? `${parts[parts.length - 2]}${parts[parts.length - 1]}`
                        : parts.pop();
                      return (
                        <Badge key={s} variant="primary" size="sm">{label}</Badge>
                      );
                    })
                  ) : (
                    <span className="seats-hint">Selecciona asientos en el mapa ↑</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="quantity-selector-compact">
                <label>Cantidad</label>
                <select
                  className="laika-select"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Total */}
            <div className="total-preview">
              <span className="total-label">Total estimado</span>
              <span className="total-amount">
                ${((selectedSection?.type === 'seating' ? selectedSeats.length : quantity) *
                  cleanPrice(selectedSection?.price || event.price)).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '1.25rem' }}>
        {/* Lucky Seat Section */}
        {event.has_lucky_seat && (
          <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(234, 179, 8, 0.05)', borderRadius: '12px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <h4 style={{ color: '#EAB308', margin: 0, fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase' }}>¡Gana un ascenso!</h4>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', margin: '4px 0 0' }}>Prueba suerte por un asiento premium por solo $40</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="back-button" 
                style={{ margin: 0, flex: 1, justifyContent: 'center' }}
                onClick={() => setShowProbModal(true)}
              >
                Ver Probs.
              </button>
              <button 
                className="lucky-btn-premium-gold" 
                style={{ flex: 2, height: '40px', fontSize: '0.8rem' }}
                onClick={handleLuckySeat}
                disabled={isRouletteActive}
              >
                <Icon name="zap" size={16} style={{ marginRight: '8px' }} />
                {isRouletteActive ? 'Girando...' : 'Jugar Ruleta'}
              </button>
            </div>
          </div>
        )}

        {/* Add to Cart */}
        <button 
          className="buy-btn-premium"
          onClick={handleAddToCart}
          disabled={!selectedSection && selectedSeats.length === 0}
        >
          <Icon name="shopping-cart" size={20} style={{ marginRight: '10px' }} />
          {selectedSeats.length > 0 ? `Comprar ${selectedSeats.length} Asientos` : 'Añadir al Carrito'}
        </button>
      </div>
    </div>
  );
}