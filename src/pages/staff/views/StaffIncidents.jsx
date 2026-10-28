import React, { useState } from 'react';
import { AlertTriangle, Send, CheckCircle2, MapPin, Radio, Shield, AlertOctagon, Info, RefreshCw } from 'lucide-react';
import { PermissionWall } from '../../../components';
import { BentoCard, BentoHeader, BentoBadge } from '../../../components/Bento';
import { useNotification } from '../../../context/NotificationContext';
import '../StaffDashboard.css';

/**
 * StaffIncidents - Estación Bento Box de Reporte y Despacho de Problemas en Campo.
 * Conexión prioritaria entre operadores en puerta y el Centro de Mando/Seguridad.
 */
const StaffIncidents = () => {
  const { success, error: showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'low',
    location: 'Puerta Principal - Acceso 1'
  });

  const [history, setHistory] = useState([
    {
      id: 1,
      title: 'Boleto Ilegible en Lector Óptico',
      location: 'Puerta A - Torniquete 2',
      severity: 'low',
      status: 'resolved',
      time: 'Hace 15 min'
    },
    {
      id: 2,
      title: 'Congestión en Punto de Revisión',
      location: 'Acceso Sur - General',
      severity: 'medium',
      status: 'pending',
      time: 'En revisión'
    }
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      showError('Por favor completa el título y la descripción detallada del reporte');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newIncident = {
        id: Date.now(),
        title: formData.title.trim(),
        location: formData.location.trim() || 'Zona General',
        severity: formData.severity,
        status: 'pending',
        time: 'Hace un momento'
      };
      setHistory([newIncident, ...history]);
      success('Reporte transmitido exitosamente a la Central de Supervisión');
      setFormData({
        title: '',
        description: '',
        severity: 'low',
        location: 'Puerta Principal - Acceso 1'
      });
      setLoading(false);
    }, 600);
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'high':
        return (
          <BentoBadge variant="error">
            <AlertOctagon size={12} /> ALTA • CRÍTICO
          </BentoBadge>
        );
      case 'medium':
        return (
          <BentoBadge variant="warning">
            <AlertTriangle size={12} /> MEDIA • ASISTENCIA
          </BentoBadge>
        );
      case 'low':
      default:
        return (
          <BentoBadge variant="info">
            <Info size={12} /> BAJA • INFORMATIVO
          </BentoBadge>
        );
    }
  };

  return (
    <PermissionWall
      permission="canValidateTickets"
      title="OPERACIÓN RESTRINGIDA"
      description="No dispones de credenciales de Staff o Seguridad activas para registrar incidencias de campo."
    >
      <div className="staff-dashboard-page">
        {/* ── Cabecera de la Estación de Incidencias ─────────────────── */}
        <header className="staff-header">
          <div className="staff-header-content">
            <h1>
              <AlertTriangle size={28} className="staff-header-icon warning" />
              Reporte de Problemas • Canal de Seguridad
            </h1>
            <p className="staff-subtitle">
              Comunicación prioritaria con el Centro de Mando, Jefes de Seguridad y Supervisores en turno
            </p>
          </div>

          <div className="staff-health-info">
            <div className="staff-health-item">
              <span className="staff-health-label">Canal de Emergencia</span>
              <div className="staff-health-value">
                <span className="staff-status-dot online" />
                <Radio size={14} className="staff-radio-icon" />
                <span>RADIO ENLACE ACTIVO</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Cuadrícula Bento de Despacho ─────────────────────────── */}
        <div className="bento-grid staff-incidents-bento-grid">
          {/* Columna Izquierda: Formulario de Emisión (col-7) */}
          <BentoCard
            colSpan={7}
            variant="hero"
            className="staff-incident-form-card"
            header={
              <BentoHeader
                title="Emitir Nuevo Reporte de Incidencia"
                subtitle="El reporte será despachado de inmediato a los radios de supervisores"
                icon={<Shield size={20} />}
              />
            }
          >
            <form onSubmit={handleSubmit} className="staff-incident-form">
              {/* Título y Asunto */}
              <div className="staff-incident-field-group">
                <label htmlFor="incident-title" className="staff-incident-label">
                  TÍTULO DEL PROBLEMA O ALERTA *
                </label>
                <input
                  id="incident-title"
                  type="text"
                  className="staff-incident-input"
                  placeholder="Ej. Falla en lector láser de puerta / Asistente sin acreditación"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Selector Táctil de Severidad */}
              <div className="staff-incident-field-group">
                <label className="staff-incident-label">NIVEL DE PRIORIDAD / SEVERIDAD</label>
                <div className="staff-severity-chips">
                  <button
                    type="button"
                    className={`staff-severity-chip low ${formData.severity === 'low' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, severity: 'low' })}
                  >
                    <Info size={16} />
                    <span>Baja (Aviso)</span>
                  </button>
                  <button
                    type="button"
                    className={`staff-severity-chip medium ${formData.severity === 'medium' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, severity: 'medium' })}
                  >
                    <AlertTriangle size={16} />
                    <span>Media (Asistencia)</span>
                  </button>
                  <button
                    type="button"
                    className={`staff-severity-chip high ${formData.severity === 'high' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, severity: 'high' })}
                  >
                    <AlertOctagon size={16} />
                    <span>Alta (Seguridad)</span>
                  </button>
                </div>
              </div>

              {/* Ubicación en el Recinto */}
              <div className="staff-incident-field-group">
                <label htmlFor="incident-location" className="staff-incident-label">
                  UBICACIÓN EXACTA O ZONA DE CAMPO
                </label>
                <div className="staff-incident-location-wrap">
                  <MapPin size={16} className="staff-incident-location-icon" />
                  <input
                    id="incident-location"
                    type="text"
                    className="staff-incident-input with-icon"
                    placeholder="Ej. Puerta Principal - Torniquete 3 / Taquilla Externa"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              {/* Descripción Técnica Detallada */}
              <div className="staff-incident-field-group">
                <label htmlFor="incident-description" className="staff-incident-label">
                  DESCRIPCIÓN DE LOS HECHOS *
                </label>
                <textarea
                  id="incident-description"
                  className="staff-incident-textarea"
                  rows={4}
                  placeholder="Detalla lo acontecido e indica si existe congestión o riesgo en la línea de ingreso..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Botón de Envío Ergonómico */}
              <button
                type="submit"
                className="staff-incident-submit-btn"
                disabled={loading || !formData.title.trim() || !formData.description.trim()}
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="staff-spin-icon" />
                    <span>Transmitiendo a Central de Seguridad...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Transmitir Reporte a Central de Mando</span>
                  </>
                )}
              </button>
            </form>
          </BentoCard>

          {/* Columna Derecha: Bitácora de Alertas Reportadas (col-5) */}
          <BentoCard
            colSpan={5}
            className="staff-incident-history-card"
            header={
              <BentoHeader
                title="Bitácora de Alertas"
                subtitle="Historial de incidencias despachadas hoy"
                icon={<Radio size={20} />}
                action={
                  <span className="staff-history-counter-pill">
                    {history.length} emitidas
                  </span>
                }
              />
            }
          >
            <div className="staff-incident-history-list">
              {history.length === 0 ? (
                <div className="staff-incidents-empty">
                  <CheckCircle2 size={36} className="staff-incident-empty-icon" />
                  <h4 className="staff-incident-empty-title">Sin alertas activas</h4>
                  <p className="staff-incident-empty-desc">
                    El canal operativo no registra incidencias pendientes en este sector.
                  </p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="staff-incident-item-bento">
                    <div className="staff-incident-item-header">
                      <h5 className="staff-incident-item-title">{item.title}</h5>
                      {getSeverityBadge(item.severity)}
                    </div>

                    <div className="staff-incident-item-meta">
                      <span className="staff-incident-meta-location">
                        <MapPin size={13} /> {item.location}
                      </span>
                      <span className="staff-incident-meta-time">{item.time}</span>
                    </div>

                    <div className="staff-incident-item-footer">
                      <BentoBadge variant={item.status === 'resolved' ? 'success' : 'warning'}>
                        {item.status === 'resolved' ? 'ATENDIDA EN CAMPO' : 'EN ATENCIÓN'}
                      </BentoBadge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </BentoCard>
        </div>
      </div>
    </PermissionWall>
  );
};

export default StaffIncidents;
