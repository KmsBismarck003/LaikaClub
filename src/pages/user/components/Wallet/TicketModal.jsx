import React, { useState } from 'react';
import TicketV1 from './bol_v1/TicketV1';
import TicketV2 from './bol_v2/TicketV2';
import Icon from '../../../../components/Icons/Icons';
import { isTicketPastEvent } from './walletUtils';

// Plantillas habilitadas en producción: únicamente Clásico (v1) y Coleccionista (v2)
const ENABLED_VERSIONS = {
  v1: { name: 'Clásico', component: TicketV1 },
  v2: { name: 'Coleccionista', component: TicketV2 },
};

export default function TicketModal({ ticket, onClose, isPast = false }) {
  const [version, setVersion] = useState('v1');

  const isCancelled = ticket?.status === 'cancelled' || ticket?.status === 'refunded';
  const isTransferred = ticket?.status === 'transferred';
  const isPendingTransfer = ticket?.status === 'transfer_pending';
  const isPastEvent = Boolean(isPast) || isTicketPastEvent(ticket);

  if (isCancelled || isTransferred || isPendingTransfer) {
    const title = isCancelled
      ? 'Boleto Cancelado'
      : isTransferred
        ? 'Boleto Transferido'
        : 'Transferencia en Proceso';

    const subtitle = isCancelled
      ? 'Acceso Revocado'
      : isTransferred
        ? 'Credencial Invalidada'
        : 'Boleto Congelado';

    const desc = isCancelled
      ? 'Este boleto fue cancelado o devuelto por reembolso. Su código QR ha sido deshabilitado de forma permanente en los lectores de acceso y no es válido para entrar al evento.'
      : isTransferred
        ? 'La propiedad de este boleto fue transferida a otro usuario. El código QR original ha sido invalidado permanentemente y no permite ingresar al evento.'
        : 'Este boleto tiene una transferencia pendiente de aceptación. El acceso está temporalmente bloqueado hasta que el destinatario acepte o se cancele la solicitud.';

    const accentColor = isCancelled ? '#ef4444' : isTransferred ? '#818cf8' : '#f59e0b';
    const accentBg = isCancelled ? 'rgba(239, 68, 68, 0.15)' : isTransferred ? 'rgba(129, 140, 248, 0.15)' : 'rgba(245, 158, 11, 0.15)';
    const iconName = isCancelled ? 'close' : isTransferred ? 'check' : 'clock';

    return (
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#0d0d12',
          border: `1px solid ${accentColor}66`,
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
            background: accentBg,
            border: `2px solid ${accentColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accentColor
          }}
        >
          <Icon name={iconName} size={32} />
        </div>

        <div>
          <span
            style={{
              fontSize: '.62rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: accentColor,
              display: 'block',
              marginBottom: '.4rem'
            }}
          >
            {subtitle}
          </span>
          <h2 style={{ margin: '0 0 .5rem', fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>
            {title}
          </h2>
          <p style={{ margin: 0, fontSize: '.75rem', color: '#888', lineHeight: 1.5 }}>
            {desc}
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
          <span style={{ color: '#666', fontWeight: 700 }}>
            {isTransferred ? 'CÓDIGO TRANSFERIDO' : isPendingTransfer ? 'ESTADO' : 'CÓDIGO ANULADO'}
          </span>
          <span style={{ color: accentColor, fontFamily: 'monospace', fontWeight: 900, textDecoration: isPendingTransfer ? 'none' : 'line-through' }}>
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

  const ActiveComponent = ENABLED_VERSIONS[version]?.component || TicketV1;
  const isCourtesy = Boolean(ticket?.is_courtesy || ticket?.isCourtesy);

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        width: '100%',
        maxWidth: '460px',
      }}
    >
      {/* Indicators: Courtesy or Past Event archive */}
      {(isCourtesy || isPastEvent) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', zIndex: 10000 }}>
          {isCourtesy && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(139, 92, 246, 0.14)',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                borderRadius: '99px',
                padding: '0.35rem 1rem',
                color: '#c4b5fd',
                fontSize: '0.65rem',
                fontWeight: 800,
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8b5cf6' }} />
              Boleto Oficial de Cortesía • Intransferible
            </div>
          )}
          {isPastEvent && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                borderRadius: '99px',
                padding: '0.35rem 1rem',
                color: '#d4d4d8',
                fontSize: '0.65rem',
                fontWeight: 800,
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              <Icon name="history" size={13} />
              Evento Concluido • Edición de Recuerdo
            </div>
          )}
        </div>
      )}

      {/* Sleek presentation switcher: Clásico & Coleccionista */}
      <div
        style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '99px',
          padding: '4px',
          zIndex: 10000,
        }}
      >
        {Object.entries(ENABLED_VERSIONS).map(([key, item]) => (
          <button
            key={key}
            type="button"
            onClick={() => setVersion(key)}
            style={{
              background: version === key ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
              color: version === key ? '#fff' : '#a1a1aa',
              border: 'none',
              minHeight: '36px',
              padding: '0.45rem 1.25rem',
              borderRadius: '99px',
              fontSize: '0.68rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Render selected ticket template */}
      <ActiveComponent ticket={ticket} onClose={onClose} isPast={isPastEvent} />
    </div>
  );
}

