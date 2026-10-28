import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, Clock, ShieldAlert } from 'lucide-react';
import '../StaffDashboard.css';

/**
 * StatusMessage - Tarjeta de estatus óptico de validación Bento Box.
 * Calibrada para alta visibilidad ergonómica en campo tanto en Light como en Dark Mode.
 */
const StatusMessage = ({ status, message, statusCode, statusTitle, timeRemainingSeconds }) => {
  let iconComponent = null;
  let statusClass = 'invalid';
  let title = statusTitle || '';

  switch (status || statusCode) {
    case 'valid':
    case 'VALID_ACCESS':
      iconComponent = <CheckCircle2 size={36} className="staff-status-icon-svg valid" />;
      statusClass = 'valid';
      title = title || 'ACCESO AUTORIZADO';
      break;
    case 'used':
    case 'ALREADY_REDEEMED':
    case 'REDEEMED_SUCCESS':
      iconComponent = <AlertTriangle size={36} className="staff-status-icon-svg warning" />;
      statusClass = 'used';
      title = title || (statusCode === 'REDEEMED_SUCCESS' ? 'INGRESO REGISTRADO' : 'BOLETO PREVIAMENTE CANJEADO');
      break;
    case 'future':
    case 'FUTURE_EVENT':
      iconComponent = <Info size={36} className="staff-status-icon-svg info" />;
      statusClass = 'future';
      title = title || 'AÚN NO ES FECHA NI HORA • PUERTAS CERRADAS';
      break;
    case 'concluded':
    case 'CONCLUDED_EVENT':
      iconComponent = <Clock size={36} className="staff-status-icon-svg warning" />;
      statusClass = 'concluded';
      title = title || 'EVENTO YA CONCLUIDO • FECHA EXPIRADA';
      break;
    case 'warning':
    case 'WRONG_FUNCTION':
    case 'WRONG_EVENT':
      iconComponent = <AlertTriangle size={36} className="staff-status-icon-svg warning" />;
      statusClass = 'warning';
      title = title || 'ESTE BOLETO NO ES PARA ESTE EVENTO';
      break;
    case 'REVOKED_TICKET':
      iconComponent = <ShieldAlert size={36} className="staff-status-icon-svg error" />;
      statusClass = 'invalid';
      title = title || 'BOLETO CANCELADO • ACCESO REVOCADO';
      break;
    case 'invalid':
    case 'INVALID_CODE':
    case 'TRANSFERRED_TICKET':
    default:
      iconComponent = <XCircle size={36} className="staff-status-icon-svg error" />;
      statusClass = 'invalid';
      title = title || 'ACCESO DENEGADO O INVÁLIDO';
      break;
  }

  return (
    <div className={`staff-status-header staff-status-header--${statusClass}`}>
      <div className={`staff-status-icon-box ${statusClass}`}>
        {iconComponent}
      </div>
      <h2 className={`staff-status-title ${statusClass}`}>{title}</h2>
      {message && <p className="staff-status-message">{message}</p>}
      {timeRemainingSeconds > 0 && (
        <div className="staff-status-countdown">
          <Clock size={16} />
          <span>Apertura en aprox: {Math.floor(timeRemainingSeconds / 3600)}h {Math.floor((timeRemainingSeconds % 3600) / 60)}m</span>
        </div>
      )}
    </div>
  );
};

export default StatusMessage;

