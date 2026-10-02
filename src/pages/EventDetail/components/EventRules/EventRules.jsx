import React from 'react';
import { Icon } from '../../../../components';
import './EventRules.css';

/**
 * EventRules — Muestra las reglas de acceso del evento.
 *
 * REGLA CRÍTICA: Solo renderiza si hay reglas reales en los datos del evento.
 * Si `rules` está vacío o es null → retorna null sin mostrar nada.
 * (No se muestran datos hardcodeados ni fallbacks inventados.)
 *
 * @param {Array} rules — Array de objetos { title, icon, description } o null
 */
export default function EventRules({ rules }) {
  // Graceful degradation: si no hay reglas, el layout se acomoda solo
  if (!rules || rules.length === 0) return null;

  return (
    <div className="er-container">

      {/* ── Header ── */}
      <div className="er-header">
        <span className="er-header-dot" aria-hidden="true" />
        <h2 className="er-title">Reglas de Acceso</h2>
      </div>

      {/* ── Grid de reglas ── */}
      <div className="er-grid">
        {rules.map((rule, idx) => (
          <div key={idx} className="er-item">
            <div className="er-icon-wrapper" aria-hidden="true">
              <Icon name={rule.icon || 'info'} size={18} />
            </div>
            <div className="er-content">
              {rule.title && (
                <h4 className="er-item-title">{rule.title}</h4>
              )}
              {rule.description && (
                <p className="er-item-desc">{rule.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
