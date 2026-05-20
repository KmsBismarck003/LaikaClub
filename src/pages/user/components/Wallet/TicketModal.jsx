import React, { useState } from 'react';
import TicketV1 from './bol_v1/TicketV1';
import TicketV2 from './bol_v2/TicketV2';
import TicketV3 from './bol_v3/TicketV3';

export default function TicketModal({ ticket, onClose }) {
  const [version, setVersion] = useState('v1');

  // Map versions to their respective components
  const versions = {
    v1: { name: 'Clásico', component: TicketV1 },
    v2: { name: 'Coleccionista', component: TicketV2 },
    v3: { name: 'Horizontal', component: TicketV3 },
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
      <ActiveComponent ticket={ticket} onClose={onClose} />
    </div>
  );
}
