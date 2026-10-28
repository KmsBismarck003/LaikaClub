import React from 'react';
import { BentoCard, BentoBadge } from '../../../../components/Bento';
import { ShieldCheck, QrCode, Search, MapPin, Calendar, CheckCircle2, ChevronRight } from 'lucide-react';

const ACCESS_POINTS = [
  'Puerta Principal - Acceso 1',
  'Acceso Norte - Gradería',
  'Acceso Sur - General',
  'Puerta VIP & Hospitality',
  'Control de Prensa & Staff',
  'Taquilla Externa - Módulo 2'
];

/**
 * OperatorHeroCard - Tarjeta Bento Hero del Operador.
 * Muestra el contexto operativo en tiempo real: operador en turno, evento activo y selector de puerta.
 */
const OperatorHeroCard = ({
  user,
  activeEvent,
  events = [],
  selectedEventId,
  onSelectEvent,
  accessPoint,
  onSelectAccessPoint,
  onOpenScanner,
  onOpenHelpDesk
}) => {
  return (
    <BentoCard colSpan={8} variant="hero" className="operator-hero-card">
      <div className="operator-hero__top">
        <div className="operator-hero__badge-row">
          <BentoBadge variant="success" dot>
            TURNO ACTIVO EN CAMPO
          </BentoBadge>
          <span className="operator-hero__session-tag">
            {user?.name || user?.firstName || 'Especialista de Control'}
          </span>
        </div>

        <div className="operator-hero__gate-selector">
          <label htmlFor="hero-access-point" className="operator-hero__gate-label">
            PUNTO DE ACCESO:
          </label>
          <select
            id="hero-access-point"
            className="operator-hero__select"
            value={accessPoint}
            onChange={(e) => onSelectAccessPoint(e.target.value)}
          >
            {ACCESS_POINTS.map((pt) => (
              <option key={pt} value={pt}>
                {pt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="operator-hero__main">
        <div className="operator-hero__event-info">
          <span className="operator-hero__event-label">
            <Calendar size={14} /> EVENTO VIGENTE ASIGNADO
          </span>
          <h2 className="operator-hero__event-title">
            {activeEvent?.name || activeEvent?.title || 'Control de Acceso General'}
          </h2>
          <div className="operator-hero__event-meta">
            <span className="operator-hero__meta-item">
              <MapPin size={14} />
              {activeEvent?.venue || activeEvent?.location || 'Sede Principal LAIKA'}
            </span>
            {activeEvent?.date && (
              <span className="operator-hero__meta-item">
                <Calendar size={14} />
                {activeEvent.date}
              </span>
            )}
          </div>
        </div>

        {events.length > 1 && (
          <div className="operator-hero__event-switch">
            <label htmlFor="hero-event-select" className="operator-hero__switch-label">
              Cambiar Recinto:
            </label>
            <select
              id="hero-event-select"
              className="operator-hero__select"
              value={selectedEventId}
              onChange={(e) => onSelectEvent(e.target.value)}
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name || ev.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="operator-hero__actions">
        <button
          type="button"
          className="operator-hero__btn-primary"
          onClick={onOpenScanner}
        >
          <QrCode size={20} />
          <span>Abrir Lector de Entradas</span>
          <ChevronRight size={16} />
        </button>

        <button
          type="button"
          className="operator-hero__btn-secondary"
          onClick={onOpenHelpDesk}
        >
          <Search size={18} />
          <span>Soporte de Entrada</span>
        </button>
      </div>
    </BentoCard>
  );
};

export default OperatorHeroCard;
