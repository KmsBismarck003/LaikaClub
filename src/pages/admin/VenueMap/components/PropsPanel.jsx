import React from 'react';

const COLORS = ['#3f3f46','#7c3aed','#9333ea','#2563eb','#0891b2','#059669','#d97706','#dc2626','#ea580c','#be185d'];

const ELEMENT_ICONS = {
  stage:  '🎸',
  screen: '🖥',
  aisle:  '⟺',
  ga:     '👥',
  seats:  '🪑',
};

const PropsPanel = ({
  selected, selectedSeats,
  onUpdate, onDelete, onDuplicate, onAddSeat,
  onChangeSeatType, onDeleteSeats, onClearSelection,
}) => {
  // If seats are selected, show seat-type changer
  if (selectedSeats.length > 0) {
    return (
      <aside className="avm-props-panel" key="seats-selection">
        <div className="avm-props-header">
          <span className="avm-props-title">✦ SELECCIÓN</span>
        </div>
        <div className="avm-props-body">
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>
            <strong style={{ color: '#eab308', marginRight: '4px' }}>{selectedSeats.length}</strong>
            {`asientos seleccionados`}
          </div>

          <div className="avm-field">
            <label className="avm-field-label">Cambiar tipo</label>
            <div className="avm-type-grid">
              <button className="avm-type-btn" onClick={() => onChangeSeatType('normal')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx={12} cy={12} r={9}/>
                </svg>
                Normal
              </button>
              <button className="avm-type-btn" onClick={() => onChangeSeatType('vip')}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                </svg>
                VIP
              </button>
              <button className="avm-type-btn" onClick={() => onChangeSeatType('accessible')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx={12} cy={5} r={2}/>
                  <path d="M12 8v6m-3 6l3-4 3 4M9 14h6"/>
                </svg>
                Accesible
              </button>
            </div>
          </div>

          <div className="avm-seat-legend">
            <div className="avm-legend-row">
              <div className="avm-legend-dot" style={{ background: '#2a2a2a', border: '1px solid #555' }} />
              Normal
            </div>
            <div className="avm-legend-row">
              <div className="avm-legend-dot" style={{ background: '#1a1a2e', border: '1.5px solid #9333ea' }} />
              VIP
            </div>
            <div className="avm-legend-row">
              <div className="avm-legend-dot" style={{ background: '#0f2027', border: '1.5px solid #06b6d4' }} />
              ♿ Accesible
            </div>
          </div>

          <button className="avm-action-btn danger" onClick={onDeleteSeats}>
            🗑 Eliminar seleccionados
          </button>
          <button className="avm-action-btn" onClick={onClearSelection}>
            ✕ Deseleccionar
          </button>
        </div>
      </aside>
    );
  }

  if (!selected) {
    return (
      <aside className="avm-props-panel" key="empty-selection">
        <div className="avm-props-header">
          <span className="avm-props-title">✦ PROPIEDADES</span>
        </div>
        <div className="avm-props-empty">
          <div className="avm-props-empty-icon">◻</div>
          <div className="avm-props-empty-text">Selecciona un elemento para editar sus propiedades</div>
        </div>
      </aside>
    );
  }

  const isSeats = selected.type === 'seats';
  const seatCount = isSeats
    ? (selected.blocks?.reduce((s, b) => s + b.seats.length, 0) || 0)
    : null;

  return (
    <aside className="avm-props-panel" key="element-properties">
      <div className="avm-props-header">
        <span className="avm-props-title">{`${ELEMENT_ICONS[selected.type]} ${selected.type.toUpperCase()}`}</span>
      </div>

      <div className="avm-props-body">
        {/* Name */}
        <div className="avm-field">
          <label className="avm-field-label">Nombre</label>
          <input
            className="avm-field-input"
            value={selected.name || ''}
            onChange={e => onUpdate({ name: e.target.value })}
          />
        </div>

        {/* Price (seats only) */}
        {isSeats && (
          <div className="avm-field">
            <label className="avm-field-label">Precio base</label>
            <input
              className="avm-field-input"
              type="text"
              value={selected.price || ''}
              placeholder="ej. 350"
              onChange={e => onUpdate({ price: e.target.value })}
            />
          </div>
        )}

        {/* Color */}
        <div className="avm-field">
          <label className="avm-field-label">Color</label>
          <div className="avm-color-grid">
            {COLORS.map(c => (
              <div
                key={c}
                className={`avm-color-swatch${selected.color === c ? ' selected' : ''}`}
                style={{ background: c }}
                onClick={() => onUpdate({ color: c })}
              />
            ))}
          </div>
        </div>

        {/* Rotation */}
        <div className="avm-field">
          <label className="avm-field-label">Rotación: {Math.round(selected.rotation || 0)}°</label>
          <input
            type="range" min={-180} max={180} step={5}
            value={selected.rotation || 0}
            onChange={e => onUpdate({ rotation: +e.target.value })}
            style={{ width: '100%', accentColor: '#eab308' }}
          />
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            {[-90, 0, 90, 180].map(deg => (
              <button key={deg} className="avm-sel-btn" onClick={() => onUpdate({ rotation: deg })}>
                {deg}°
              </button>
            ))}
          </div>
        </div>

        {/* Width/Height (non-seats) */}
        {!isSeats && (
          <div className="avm-field-row">
            <div className="avm-field">
              <label className="avm-field-label">Ancho</label>
              <input
                className="avm-field-input" type="number"
                value={Math.round(selected.width || 100)}
                onChange={e => onUpdate({ width: +e.target.value })}
              />
            </div>
            <div className="avm-field">
              <label className="avm-field-label">Alto</label>
              <input
                className="avm-field-input" type="number"
                value={Math.round(selected.height || 50)}
                onChange={e => onUpdate({ height: +e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Seat info */}
        {isSeats && seatCount !== null && (
          <div style={{
            padding: '10px 12px', borderRadius: '8px',
            background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.15)',
            fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)'
          }}>
            <span style={{ color: '#eab308', fontWeight: 800, fontSize: '1rem', marginRight: '4px' }}>{seatCount}</span>
            {`asientos en ${selected.blocks?.length || 0} fila${selected.blocks?.length !== 1 ? 's' : ''}`}
          </div>
        )}

        {/* Add seat */}
        {isSeats && (
          <button className="avm-action-btn" onClick={onAddSeat}>
            ＋ Agregar asiento al final
          </button>
        )}

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.25rem 0' }} />

        {/* Duplicate & Delete */}
        <button className="avm-action-btn" onClick={onDuplicate}>
          ⧉ Duplicar
        </button>
        <button className="avm-action-btn danger" onClick={onDelete}>
          🗑 Eliminar
        </button>
      </div>
    </aside>
  );
};

export default PropsPanel;
