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
    <div className="avm-modal-overlay" role="dialog" aria-modal="true" aria-label="Plantillas prediseñadas">
      <div className="avm-modal" style={{ maxWidth: '680px' }}>
        <div className="avm-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LayoutTemplate size={18} />
            <h3>Plantillas Prediseñadas</h3>
          </div>
          <button type="button" className="avm-modal-close" onClick={onCancel} aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>
        <div className="avm-modal-body">
          <p style={{ color: 'var(--text-secondary, #475569)', fontSize: '0.84rem', marginTop: 0, marginBottom: '1.1rem' }}>
            Selecciona una plantilla base. Todos los asientos, escenarios y pasillos generados serán editables una vez cargados en el mapa.
          </p>

          <div className="avm-template-grid">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                className="avm-template-card"
                onClick={() => handleSelect(t)}
              >
                <div className="avm-template-name">{t.name}</div>
                <div className="avm-template-desc">{t.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelectorModal;
