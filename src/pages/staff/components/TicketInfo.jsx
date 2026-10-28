import React from 'react';
import { User, Calendar, Tag, ShieldCheck, Hash, Gift } from 'lucide-react';
import { BentoBadge } from '../../../components/Bento';
import '../StaffDashboard.css';

/**
 * TicketInfo - Ficha modular Bento con los detalles del boleto verificado.
 * Compatible al 100% con Tema Claro y Oscuro (cero colores fijos).
 */
const TicketInfo = ({ ticket }) => {
  if (!ticket) return null;

  const isCourtesy = ticket.isCourtesy || ticket.is_courtesy || ticket.ticketDetails?.isCourtesy;
  const recipientType = ticket.recipientType || ticket.ticketDetails?.recipientType || 'Invitado Especial';

  return (
    <div className="staff-ticket-info">
      <div className="staff-info-row">
        <span className="staff-info-label">
          <User size={14} className="staff-info-icon" />
          Titular / Asistente
        </span>
        <span className="staff-info-value highlight">{ticket.customerName || 'No especificado'}</span>
      </div>

      <div className="staff-info-row">
        <span className="staff-info-label">
          <Calendar size={14} className="staff-info-icon" />
          Evento Asignado
        </span>
        <span className="staff-info-value">{ticket.eventName || 'Evento LAIKA Club'}</span>
      </div>

      <div className="staff-info-row">
        <span className="staff-info-label">
          <Tag size={14} className="staff-info-icon" />
          Tipo de Boleto
        </span>
        <div className="staff-info-badge-wrap">
          <BentoBadge variant="primary">
            {ticket.ticketType || 'General'}
          </BentoBadge>
        </div>
      </div>

      {isCourtesy && (
        <div className="staff-info-row staff-courtesy-row">
          <span className="staff-info-label">
            <Gift size={14} className="staff-info-icon" />
            Modalidad Especial
          </span>
          <BentoBadge variant="warning">
            CORTESÍA OFICIAL ({recipientType})
          </BentoBadge>
        </div>
      )}

      <div className="staff-info-row">
        <span className="staff-info-label">
          <Hash size={14} className="staff-info-icon" />
          Código de Verificación
        </span>
        <span className="staff-info-code">{ticket.ticketCode}</span>
      </div>

      {ticket.purchaseDate && (
        <div className="staff-info-row">
          <span className="staff-info-label">
            <ShieldCheck size={14} className="staff-info-icon" />
            Fecha de Emisión
          </span>
          <span className="staff-info-value staff-info-date">
            {new Date(ticket.purchaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      )}
    </div>
  );
};

export default TicketInfo;
