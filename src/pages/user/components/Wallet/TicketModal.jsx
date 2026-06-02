import React, { useState } from 'react';
import TicketV1 from './bol_v1/TicketV1';
import TicketV2 from './bol_v2/TicketV2';
import TicketV3 from './bol_v3/TicketV3';
import TicketV4 from './bol_v4/TicketV4';
import TicketCard from '../../../../components/tickets/TicketCard';

export default function TicketModal({ ticket, onClose }) {
  const [version, setVersion] = useState('v5'); // Default to v5 (Premium / Phygital)

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

