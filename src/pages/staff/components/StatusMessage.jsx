import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, Clock, ShieldAlert } from 'lucide-react';
import '../StaffDashboard.css';

const StatusMessage = ({ status, message, statusCode, statusTitle, timeRemainingSeconds }) => {
  let iconComponent = null;
  let statusClass = '';
  let title = statusTitle || '';

  switch (status || statusCode) {
    case 'valid':
    case 'VALID_ACCESS':
      iconComponent = <CheckCircle2 size={36} color="var(--staff-status-valid, #10b981)" />;
      statusClass = 'valid';
      title = title || 'ACCESO AUTORIZADO';
      break;
    case 'used':
    case 'ALREADY_REDEEMED':
    case 'REDEEMED_SUCCESS':
      iconComponent = <AlertTriangle size={36} color="var(--staff-accent-primary, #a855f7)" />;
      statusClass = 'used';
      title = title || (statusCode === 'REDEEMED_SUCCESS' ? 'INGRESO REGISTRADO' : 'BOLETO PREVIAMENTE CANJEADO');
      break;
    case 'future':
    case 'FUTURE_EVENT':
      iconComponent = <Info size={36} color="var(--staff-accent-secondary, #00fff2)" />;
      statusClass = 'used';
      title = title || 'EVENTO PRÓXIMO / PUERTAS CERRADAS';
      break;
    case 'concluded':
    case 'CONCLUDED_EVENT':
      iconComponent = <Clock size={36} color="#f59e0b" />;
      statusClass = 'used';
      title = title || 'FUNCIÓN FINALIZADA';
      break;
    case 'warning':
    case 'WRONG_FUNCTION':
      iconComponent = <AlertTriangle size={36} color="#f97316" />;
      statusClass = 'used';
      title = title || 'EVENTO O FUNCIÓN INCORRECTA';
      break;
    case 'invalid':
    case 'INVALID_CODE':
    case 'REVOKED_TICKET':
    case 'TRANSFERRED_TICKET':
    default:
      iconComponent = <XCircle size={36} color="var(--staff-status-error, #ef4444)" />;
      statusClass = 'invalid';
      title = title || 'ACCESO DENEGADO O INVÁLIDO';
      break;
  }

  return (
    <div className="staff-status-header">
      <div className={`staff-status-icon-box ${statusClass}`}>
        {iconComponent}
      </div>
      <h2 className={`staff-status-title ${statusClass}`}>{title}</h2>
      {message && <p style={{ color: 'var(--staff-text-secondary)', fontSize: '1rem', margin: 0, fontWeight: 500, lineHeight: 1.5 }}>{message}</p>}
      {timeRemainingSeconds > 0 && (
        <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0, 255, 242, 0.1)', border: '1px solid rgba(0, 255, 242, 0.3)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#00fff2', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          <Clock size={16} /> Apertura en aproximadamente: {Math.floor(timeRemainingSeconds / 3600)}h {Math.floor((timeRemainingSeconds % 3600) / 60)}m
        </div>
      )}
    </div>
  );
};

export default StatusMessage;

