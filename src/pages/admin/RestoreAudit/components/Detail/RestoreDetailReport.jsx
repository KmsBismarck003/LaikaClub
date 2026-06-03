import React from 'react';
import { Icon } from '../../../../../components';
import '../../css/Detail.css';
import { formatDate, formatDuration, severityBadge, resultBadge } from '../../utils/auditHelpers';

const RestoreDetailReport = ({ selectedEvent, onBack }) => {
  if (!selectedEvent) return null;
  const { event, technical_checks: tc, functional_checks: fc, operational_impact: oi, confirmation } = selectedEvent;

  return (
    <div className="ra-detail-sections">
      <button className="ra-btn ra-btn-back" onClick={onBack} style={{ alignSelf: 'flex-start' }}>
        <span><Icon name="arrowLeft" size={14} className="mr-2" /> Volver al Historial</span>
      </button>

      {event.is_confirmed ? (
        <div className="ra-confirmed-banner">
          <span className="icon"><Icon name="lock" size={24} /></span>
          <div>
            <div className="text" style={{ color: '#22c55e', fontWeight: 600 }}>Registro Confirmado y Bloqueado</div>
            <div className="subtext" style={{ fontSize: '0.82rem', opacity: 0.8 }}>Confirmado por {event.confirmed_by_username} el {formatDate(event.confirmed_at)}</div>
          </div>
        </div>
      ) : (
        <div className="ra-pending-banner">
          <span className="icon"><Icon name="clock" size={24} /></span>
          <div className="text" style={{ fontWeight: 600, color: '#eab308' }}>Pendiente de Confirmación</div>
        </div>
      )}

      <div className="ra-detail-section">
        <h3><Icon name="fileText" className="mr-2" /> Información General</h3>
        <div className="ra-detail-grid">
          <div className="ra-detail-item"><span className="label">ID</span><span className="value">#{event.id}</span></div>
          <div className="ra-detail-item"><span className="label">Administrador</span><span className="value">{event.admin_username}</span></div>
          <div className="ra-detail-item"><span className="label">Inicio</span><span className="value">{formatDate(event.start_datetime)}</span></div>
          <div className="ra-detail-item"><span className="label">Fin</span><span className="value">{formatDate(event.end_datetime)}</span></div>
          <div className="ra-detail-item"><span className="label">Duración</span><span className="value">{formatDuration(event.duration_seconds)}</span></div>
          <div className="ra-detail-item"><span className="label">Base de Datos</span><span className="value">{event.database_name}</span></div>
          <div className="ra-detail-item"><span className="label">Tipo</span><span className="value">{event.restore_type}</span></div>
          <div className="ra-detail-item"><span className="label">Servidor</span><span className="value">{event.server_name}</span></div>
          <div className="ra-detail-item full-width"><span className="label">Motivo</span><span className="value">{event.restore_reason}</span></div>
        </div>
      </div>

      {tc && (
        <div className="ra-detail-section">
          <h3><Icon name="settings" className="mr-2" /> Validaciones Técnicas</h3>
          <div className="ra-detail-grid">
            <div className="ra-detail-item"><span className="label">Integridad</span><span className="value">{resultBadge(tc.integrity_result)}</span></div>
            <div className="ra-detail-item"><span className="label">Tablas</span><span className="value">{tc.total_tables ?? 'N/A'}</span></div>
            <div className="ra-detail-item"><span className="label">Registros</span><span className="value">{tc.critical_record_count ?? 'N/A'}</span></div>
            {tc.integrity_observations && <div className="ra-detail-item full-width"><span className="label">Obs.</span><span className="value">{tc.integrity_observations}</span></div>}
          </div>
        </div>
      )}

      {oi && (
        <div className="ra-detail-section">
          <h3><Icon name="alertTriangle" className="mr-2" /> Impacto Operativo</h3>
          <div className="ra-detail-grid">
            <div className="ra-detail-item"><span className="label">Downtime</span><span className="value">{oi.had_downtime ? `${oi.downtime_minutes} min` : 'No'}</span></div>
            <div className="ra-detail-item"><span className="label">Severidad</span><span className="value">{severityBadge(oi.severity)}</span></div>
            {oi.observations && <div className="ra-detail-item full-width"><span className="label">Obs.</span><span className="value">{oi.observations}</span></div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default RestoreDetailReport;
