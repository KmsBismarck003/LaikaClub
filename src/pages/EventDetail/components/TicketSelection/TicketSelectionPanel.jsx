/**
 * TicketSelectionPanel — Panel de seleccion de boletos con soporte para eventos gratuitos.
 *
 * Props nuevas (TAREA 2 - Eventos Gratuitos):
 *   isFreeEvent    {boolean}  - Detectado por el padre via useFreeEventFlow
 *   onClaimFree    {Function} - Handler de adquisicion directa
 *   isClaimingFree {boolean}  - Estado de carga del claim gratuito
 */
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
  setShowProbModal,
  /* Free event props */
  isFreeEvent    = false,
  onClaimFree    = null,
  isClaimingFree = false,
}) {
  const isSeating = selectedSection?.type === 'seating';
  const seatCount = isSeating ? selectedSeats.length : quantity;
  const unitPrice = cleanPrice(selectedSection?.price || event?.price || 0);
  const total = (seatCount * unitPrice).toFixed(2);

  const [selectedState, setSelectedState] = React.useState(() => {
    const savedState = localStorage.getItem('laika_preferred_state');
    if (savedState) return savedState;
    // Fallback to home search location if it matches a state
    const homeLoc = localStorage.getItem('laika_search_location') || '';
    if (homeLoc && homeLoc !== 'Todo México') {
      return homeLoc;
    }
    return '';
  });

  const [selectedMunicipality, setSelectedMunicipality] = React.useState(() => {
    return localStorage.getItem('laika_preferred_municipality') || '';
  });

  // Reset preferred municipality if state changes
  const handleStateChange = (e) => {
    const val = e.target.value;
    setSelectedState(val);
    setSelectedMunicipality('');
    localStorage.setItem('laika_preferred_state', val);
    localStorage.removeItem('laika_preferred_municipality');
  };

  const handleMunicipalityChange = (e) => {
    const val = e.target.value;
    setSelectedMunicipality(val);
    localStorage.setItem('laika_preferred_municipality', val);
  };

  // Get unique states from functions
  const availableStates = React.useMemo(() => {
    if (!event?.functions) return [];
    const statesSet = new Set();
    event.functions.forEach(f => {
      if (f.venue_state) statesSet.add(f.venue_state);
      else if (f.venue_city) statesSet.add(f.venue_city);
    });
    return Array.from(statesSet).sort();
  }, [event?.functions]);

  // Get unique municipalities for selected state
  const availableMunicipalities = React.useMemo(() => {
    if (!event?.functions || !selectedState) return [];
    const munSet = new Set();
    event.functions.forEach(f => {
      if (f.venue_state === selectedState || (!f.venue_state && f.venue_city === selectedState)) {
        if (f.venue_municipality) munSet.add(f.venue_municipality);
        else if (f.venue_city) munSet.add(f.venue_city);
      }
    });
    return Array.from(munSet).sort();
  }, [event?.functions, selectedState]);

  // Filter functions by state and municipality
  const filteredFunctions = React.useMemo(() => {
    if (!event?.functions) return [];
    return event.functions.filter(f => {
      if (selectedState && f.venue_state !== selectedState && f.venue_city !== selectedState) {
        return false;
      }
      if (selectedMunicipality && f.venue_municipality !== selectedMunicipality && f.venue_city !== selectedMunicipality) {
        return false;
      }
      return true;
    });
  }, [event?.functions, selectedState, selectedMunicipality]);

  const uniqueDates = React.useMemo(() => {
    const dates = filteredFunctions.map(f => f.date);
    return Array.from(new Set(dates)).sort();
  }, [filteredFunctions]);

  const selectedDate = selectedFunction?.date || uniqueDates[0] || null;

  const functionsForSelectedDate = React.useMemo(() => {
    if (!selectedDate) return [];
    return filteredFunctions.filter(f => f.date === selectedDate);
  }, [filteredFunctions, selectedDate]);

  // Auto-select first function when filters or functions change
  React.useEffect(() => {
    if (filteredFunctions.length > 0) {
      const isStillValid = filteredFunctions.some(f => f.id === selectedFunction?.id);
      if (!isStillValid) {
        setSelectedFunction(filteredFunctions[0]);
      }
    } else {
      setSelectedFunction(null);
    }
  }, [filteredFunctions, selectedFunction, setSelectedFunction]);

  return (
    <div className="ticket-selection-panel">

      {/* ── Selector de Fecha/Funcion ── */}
      {hasFunctions && (
        <div className="tsp-header" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          
          {/* Geographic Filter */}
          <div>
            <p className="tsp-section-label">📍 Filtrar por ubicación</p>
            <div className="geo-filter-row" style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <div style={{ flex: 1 }}>
                <select
                  className="laika-select"
                  style={{ width: '100%', fontSize: '0.72rem', padding: '6px 20px 6px 8px', height: '34px' }}
                  value={selectedState}
                  onChange={handleStateChange}
                >
                  <option value="">Todos los Estados</option>
                  {availableStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <select
                  className="laika-select"
                  style={{ width: '100%', fontSize: '0.72rem', padding: '6px 20px 6px 8px', height: '34px' }}
                  value={selectedMunicipality}
                  onChange={handleMunicipalityChange}
                  disabled={!selectedState}
                >
                  <option value="">Todos los Municipios</option>
                  {availableMunicipalities.map(mun => (
                    <option key={mun} value={mun}>{mun}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {filteredFunctions.length > 0 ? (
            <>
              <div>
                <p className="tsp-section-label">Selecciona el dia</p>
                <div className="function-chips">
                  {uniqueDates.map(d => (
                    <div
                      key={d}
                      className={`function-chip ${selectedDate === d ? 'active' : ''}`}
                      onClick={() => {
                        const firstFuncForDate = filteredFunctions.find(f => f.date === d);
                        if (firstFuncForDate) setSelectedFunction(firstFuncForDate);
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
                          display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                          padding: '8px 12px', width: '100%', textTransform: 'none', letterSpacing: 'normal'
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
            </>
          ) : (
            <div style={{ 
              padding: '1rem', 
              textAlign: 'center', 
              color: 'rgba(255, 255, 255, 0.4)', 
              fontSize: '0.72rem', 
              border: '1px dashed rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              📍 No hay funciones disponibles en la ubicación seleccionada.
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
            <div className="ticket-minimap">
              {section.name?.substring(0, 1)?.toUpperCase()}
            </div>

            <div className="ticket-info">
              <div className="ticket-section-title">
                {section.name}
                {section.type === 'seating' && (
                  <Badge variant="premium" size="sm">Asignado</Badge>
                )}
              </div>
              <div className="ticket-type-desc">
                <span className="dot-indicator" />
                {section.type === 'seating' ? 'Seleccion en mapa' : 'Entrada General'}
              </div>
              <div className="ticket-price-val">
                {isFreeEvent
                  ? <span style={{ color: '#22c55e', fontWeight: 800 }}>GRATIS</span>
                  : <span>{`$${cleanPrice(section.price)}`} <span className="each">c/u</span></span>
                }
              </div>
            </div>

            <div className={`mock-radio ${selectedSection?.id === section.id ? 'checked' : ''}`} />
          </div>
        ))}
      </div>

      {/* ── Bottom de Compra ── */}
      {selectedSection && (
        <div className="tsp-purchase-bottom">

          {/* Asientos o Cantidad — solo para eventos de pago */}
          {isSeating ? (
            <div className="tsp-seats-row">
              <span className="tsp-seats-label">Asientos</span>
              <div className="selected-seats-chips">
                {selectedSeats.length > 0 ? (
                  selectedSeats.map(s => {
                    const label = getSeatLabel(s, event);
                    return <Badge key={s} variant="primary" size="sm">{label}</Badge>;
                  })
                ) : (
                  <span className="seats-hint">Selecciona en el mapa arriba</span>
                )}
              </div>
            </div>
          ) : !isFreeEvent ? (
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
          ) : null}

          {/* Total — solo para eventos de pago */}
          {!isFreeEvent && (
            <div className="total-preview">
              <span className="total-label">Total estimado</span>
              <span className="total-amount">{`$${total}`}</span>
            </div>
          )}

          {/* ── Botones de Accion ── */}
          {isFreeEvent ? (
            /* EVENTO GRATUITO: un solo boton, sin carrito ni pagos */
            <button
              id="free-ticket-claim-btn"
              className="buy-btn-premium"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)',
              }}
              onClick={onClaimFree}
              disabled={isClaimingFree || (isSeating && selectedSeats.length === 0)}
            >
              {isClaimingFree ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                  <span style={{
                    width: '16px', height: '16px',
                    border: '2px solid rgba(255,255,255,.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.6s linear infinite',
                  }} />
                  <span>Registrando...</span>
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Obtener Entrada Gratis</span>
                </span>
              )}
            </button>
          ) : (
            /* EVENTO DE PAGO: carrito + compra directa */
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
                Anadir
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
          )}
        </div>
      )}
    </div>
  );
}