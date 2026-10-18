import React, { useState } from 'react';
import TicketV1 from './bol_v1/TicketV1';
import TicketV2 from './bol_v2/TicketV2';
import TicketV3 from './bol_v3/TicketV3';
import TicketV4 from './bol_v4/TicketV4';
import TicketCard from '../../../../components/tickets/TicketCard';

import Icon from '../../../../components/Icons/Icons';

export default function TicketModal({ ticket, onClose }) {
  const [version, setVersion] = useState('v5'); // Default to v5 (Premium / Phygital)

  const isCancelled = ticket?.status === 'cancelled' || ticket?.status === 'refunded';

  if (isCancelled) {
    return (
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#0d0d12',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '24px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1.25rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
          zIndex: 10000
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '2px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444'
          }}
        >
          <Icon name="close" size={32} />
        </div>

        <div>
          <span
            style={{
              fontSize: '.62rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#ef4444',
              display: 'block',
              marginBottom: '.4rem'
            }}
          >
            Acceso Revocado
          </span>
          <h2 style={{ margin: '0 0 .5rem', fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>
            Boleto Cancelado
          </h2>
          <p style={{ margin: 0, fontSize: '.75rem', color: '#888', lineHeight: 1.5 }}>
            Este boleto fue cancelado o devuelto por reembolso. Su código QR ha sido deshabilitado de forma permanente en los lectores de acceso y no es válido para entrar al evento.
          </p>
        </div>

        <div
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '.75rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '.72rem'
          }}
        >
          <span style={{ color: '#666', fontWeight: 700 }}>CÓDIGO ANULADO</span>
          <span style={{ color: '#ef4444', fontFamily: 'monospace', fontWeight: 900, textDecoration: 'line-through' }}>
            {ticket?.ticket_code || ticket?.ticketCode || 'TKT-REVOKED'}
          </span>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#fff',
            padding: '.75rem',
            borderRadius: '12px',
            fontSize: '.72rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: 'pointer',
            transition: 'background .2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
        >
          Cerrar
        </button>
      </div>
    );
  }

  // Map versions to their respective components
  const versions = {
    v1: { name: 'Clásico', component: TicketV1 },
    v2: { name: 'Coleccionista', component: TicketV2 },
    v3: { name: 'Horizontal', component: TicketV3 },
    v4: { name: 'Concierto', component: TicketV4 },
    v5: { name: 'Premium', component: TicketCard },
  };

  const ActiveComponent = versions[version]?.component || TicketV1;

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
      }}
    >
      {/* Sleek presentation switcher */}
      <div
        style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '99px',
          padding: '4px',
          zIndex: 10000,
        }}
      >
        {Object.entries(versions).map(([key, item]) => (
          <button
            key={key}
            onClick={() => setVersion(key)}
            style={{
              background: version === key ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: version === key ? '#fff' : '#666',
              border: 'none',
              padding: '0.4rem 1rem',
              borderRadius: '99px',
              fontSize: '0.6rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={e => {
              if (version !== key) e.currentTarget.style.color = '#aaa';
            }}
            onMouseOut={e => {
              if (version !== key) e.currentTarget.style.color = '#666';
            }}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Render selected ticket version */}
      {version === 'v5' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', alignItems: 'center' }}>
          <TicketCard ticket={ticket} />
          <button
            onClick={onClose}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; e.currentTarget.style.color = '#aaa'; }}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#aaa',
              padding: '0.65rem 2rem',
              borderRadius: '99px',
              fontSize: '0.65rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              width: '100%',
              textAlign: 'center',
            }}
          >
            Cerrar boleto
          </button>
        </div>
      ) : (
        <ActiveComponent ticket={ticket} onClose={onClose} />
      )}
    </div>
  );
}

