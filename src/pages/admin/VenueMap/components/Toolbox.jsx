import React from 'react';

const TOOLS = [
  { id: 'select',     icon: '↖', label: 'Selec.' },
  { id: 'add-seats',  icon: '🪑', label: 'Asientos' },
  { id: 'add-stage',  icon: '🎸', label: 'Escenario' },
  { id: 'add-screen', icon: '🖥', label: 'Pantalla' },
  { id: 'add-aisle',  icon: '⟺', label: 'Pasillo' },
  { id: 'add-ga',     icon: '👥', label: 'General' },
];

const TYPE_COLORS = { seats: '#eab308', stage: '#475569', screen: '#1e3a8a', aisle: '#27272a', ga: '#14532d' };

const getInstruction = (tool) => {
  switch (tool) {
    case 'select': return '← Arrastra elementos. Click en asiento para seleccionar. Doble-click para seleccionar fila completa.';
    case 'add-seats': return '← Click en el canvas para abrir el wizard de filas.';
    case 'add-stage': return '← Click en el canvas para colocar el escenario.';
    case 'add-screen': return '← Click en el canvas para colocar la pantalla.';
    case 'add-aisle': return '← Click en el canvas para colocar un pasillo.';
    case 'add-ga': return '← Click para colocar una zona de acceso general.';
    default: return '';
  }
};

const Toolbox = ({ activeTool, setActiveTool, components, selectedId, onSelectComponent }) => {
  return (
    <aside className="avm-sidebar">
      {/* Tools */}
      <div className="avm-sidebar-section">
        <div className="avm-sidebar-label">Herramientas</div>
        <div className="avm-tool-grid">
          {TOOLS.map(t => (
            <button
              key={t.id}
              className={`avm-tool-btn${activeTool === t.id ? ' active' : ''}`}
              onClick={() => setActiveTool(t.id)}
              title={t.label}
            >
              <span style={{ fontSize: '1.1rem' }}>{t.icon}</span>
              <span className="avm-tool-label">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="avm-sidebar-section" style={{ padding: '0.75rem 1rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', lineHeight: 1.6 }}>
          {getInstruction(activeTool)}
        </div>
      </div>

      {/* Shortcuts */}
      <div className="avm-sidebar-section">
        <div className="avm-sidebar-label">Atajos</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {[
            ['Ctrl+Z', 'Deshacer'],
            ['Ctrl+Y', 'Rehacer'],
            ['Esc', 'Deseleccionar'],
            ['Del/⌫', 'Eliminar'],
            ['Alt+drag', 'Mover vista'],
            ['Scroll', 'Zoom'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', padding: '3px 0' }}>
              <code style={{ color: '#eab308', background: 'rgba(234,179,8,0.1)', padding: '1px 5px', borderRadius: 4 }}>{k}</code>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Components list */}
      <div className="avm-sidebar-section" style={{ flex: 1 }}>
        <div className="avm-sidebar-label">Elementos ({components.length})</div>
        <div className="avm-comp-list">
          {components.length === 0 && (
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.15)', textAlign: 'center', padding: '1rem 0' }}>
              Sin elementos aún
            </div>
          )}
          {components.map(c => {
            const seatCount = c.type === 'seats'
              ? (c.blocks?.reduce((s, b) => s + b.seats.length, 0) || 0)
              : null;
            return (
              <div
                key={c.id}
                className={`avm-comp-item${selectedId === c.id ? ' selected' : ''}`}
                onClick={() => onSelectComponent(c.id)}
              >
                <div
                  className="avm-comp-item-dot"
                  style={{ background: c.color || TYPE_COLORS[c.type] || '#555' }}
                />
                <span className="avm-comp-item-name">{c.name}</span>
                {seatCount !== null && (
                  <span className="avm-comp-item-count">{seatCount}🪑</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default Toolbox;
