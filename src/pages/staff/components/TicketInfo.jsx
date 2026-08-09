import React from 'react';
import '../StaffDashboard.css';

const TicketInfo = ({ ticket }) => {
  if (!ticket) return null;

  return (
    <div className="staff-ticket-info">
      <div className="staff-info-row">
        <span className="staff-info-label">Titular / Asistente</span>
        <span className="staff-info-value highlight">{ticket.customerName || 'No especificado'}</span>
      </div>

      <div className="staff-info-row">
        <span className="staff-info-label">Evento Asignado</span>
        <span className="staff-info-value">{ticket.eventName || 'Evento LAIKA Club'}</span>
      </div>

      <div className="staff-info-row">
        <span className="staff-info-label">Tipo de Boleto / Acceso</span>
        <span className="staff-info-value" style={{ color: '#ffffff', fontWeight: 800 }}>
          {ticket.ticketType || 'General'}
        </span>
      </div>

      <div className="staff-info-row">
        <span className="staff-info-label">Código de Verificación</span>
        <span className="staff-info-code">{ticket.ticketCode}</span>
      </div>

      {ticket.purchaseDate && (
        <div className="staff-info-row">
          <span className="staff-info-label">Fecha de Registro</span>
          <span className="staff-info-value" style={{ color: 'var(--staff-text-secondary)', fontSize: '0.9rem' }}>
            {new Date(ticket.purchaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      )}
    </div>
  );
};

export default TicketInfo;
