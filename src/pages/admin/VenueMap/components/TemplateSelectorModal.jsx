import React from 'react';
import { X, LayoutTemplate } from 'lucide-react';
import { TEMPLATES } from '../utils/templates';

const TemplateSelectorModal = ({ onSelectTemplate, onCancel }) => {
  const handleSelect = (template) => {
    if (window.confirm('ADVERTENCIA: Aplicar una plantilla borrará todos los asientos actuales. ¿Deseas continuar?')) {
      const generatedComponents = template.generate();
      onSelectTemplate(generatedComponents);
    }
  };

  return (
    <div className="avm-modal-overlay">
      <div className="avm-modal" style={{ maxWidth: '700px' }}>
        <div className="avm-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LayoutTemplate size={20} color="#06b6d4" />
            <h3>Plantillas Prediseñadas</h3>
          </div>
          <button className="avm-modal-close" onClick={onCancel}><X size={18} /></button>
        </div>
        <div className="avm-modal-body">
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Selecciona una plantilla base. Todos los asientos, escenarios y pasillos generados serán 100% editables una vez cargados en el mapa.
          </p>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '15px' 
          }}>
            {TEMPLATES.map(t => (
              <div 
                key={t.id} 
                style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '8px', 
                  padding: '15px',
                  cursor: 'pointer',
                  transition: 'background 0.2s, borderColor 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#06b6d4'; e.currentTarget.style.background = 'rgba(6,182,212,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                onClick={() => handleSelect(t)}
              >
                <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '5px' }}>{t.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>{t.description}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TemplateSelectorModal;
