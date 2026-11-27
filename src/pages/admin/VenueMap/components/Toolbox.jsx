import React from 'react';
import { MousePointer, Grid3x3, Monitor, Minus, Users, Square, Hand } from 'lucide-react';

const TOOLS = [
  { id: 'select',     icon: <MousePointer size={18} />, label: 'Seleccionar' },
  { id: 'pan',        icon: <Hand size={18} />, label: 'Mover (Pan)' },
  { id: 'add-seats',  icon: <Grid3x3 size={18} />, label: 'Asientos' },
  { id: 'add-stage',  icon: <Square size={18} />, label: 'Escenario' },
  { id: 'add-screen', icon: <Monitor size={18} />, label: 'Pantalla' },
  { id: 'add-aisle',  icon: <Minus size={18} />, label: 'Pasillo' },
  { id: 'add-ga',     icon: <Users size={18} />, label: 'Z. General' },
];

const Toolbox = ({ activeTool, setActiveTool }) => {
  return (
    <div className="avm-floating-toolbar">
      {TOOLS.map(t => (
        <button
          key={t.id}
          className={`avm-float-btn${activeTool === t.id ? ' active' : ''}`}
          onClick={() => setActiveTool(t.id)}
          title={t.label}
        >
          {t.icon}
          {/* <span className="avm-float-label">{t.label}</span> */}
        </button>
      ))}
    </div>
  );
};

export default Toolbox;
