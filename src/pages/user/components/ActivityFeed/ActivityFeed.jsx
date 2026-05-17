import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../components/Icons/Icons';
import { SectionLabel, FALLBACK_IMAGES } from '../NextEventHero/NextEventHero';

const ActivityFeed = ({ myTickets }) => {
  const navigate = useNavigate();

  return (
    <div>
      <SectionLabel>Actividad Reciente</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
        {myTickets.slice(0, 3).map((ticket, idx) => (
          <div key={ticket.id || idx} style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            background: 'rgba(255,255,255,.03)',
            border: '1px solid rgba(255,255,255,.06)',
            borderRadius: '14px', padding: '1rem 1.25rem',
            transition: 'all .2s', cursor: 'pointer'
          }}
            onClick={() => navigate('/user/tickets')}
            onMouseOver={e => { e.currentTarget.style.background='rgba(255,255,255,.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,.1)'; }}
            onMouseOut={e => { e.currentTarget.style.background='rgba(255,255,255,.03)'; e.currentTarget.style.borderColor='rgba(255,255,255,.06)'; }}
          >
            <img
              src={ticket.event?.image_url || ticket.imageUrl || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length]}
              alt=""
              style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ margin: '0 0 .15rem', fontSize: '.85rem', fontWeight: 800, color: '#fff',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ticket.event?.name || ticket.eventName || 'Evento'}
              </h4>
              <p style={{ margin: 0, fontSize: '.65rem', color: '#555', fontWeight: 600 }}>
                🎫 {ticket.ticket_code || ticket.ticketCode || `TKT-${ticket.id || idx}`}
              </p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '.85rem', fontWeight: 900, color: '#fff' }}>
                ${parseFloat(ticket.price || 0).toLocaleString('es-MX')}
              </div>
              <Icon name="chevronRight" size={14} style={{ color: '#333', marginTop: '.2rem' }} />
            </div>
          </div>
        ))}
        {myTickets.length > 3 && (
          <button onClick={() => navigate('/user/history')} style={{
            background: 'none', border: '1px solid rgba(255,255,255,.07)',
            color: '#555', borderRadius: '12px', padding: '.7rem',
            fontSize: '.62rem', fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '1.5px', cursor: 'pointer', transition: 'all .2s'
          }}
            onMouseOver={e => { e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='rgba(255,255,255,.15)'; }}
            onMouseOut={e => { e.currentTarget.style.color='#555'; e.currentTarget.style.borderColor='rgba(255,255,255,.07)'; }}
          >
            Ver todos ({myTickets.length}) →
          </button>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
