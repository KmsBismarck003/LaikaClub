import React, { useState } from 'react';

const EventCard = ({ event, image, onAdd, onView, adding }) => {
  const [hovered, setHovered] = useState(false);
  // pick a subtle glow color per genre or just random
  const glows = ['rgba(0,112,243,.35)','rgba(168,85,247,.35)','rgba(239,68,68,.3)','rgba(34,197,94,.3)','rgba(249,115,22,.3)','rgba(234,179,8,.3)'];
  const glow  = glows[Math.abs((event.id||0) % glows.length)];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', borderRadius: '18px', overflow: 'hidden',
        height: '242px', cursor: 'default',
        border: `1px solid ${hovered ? 'rgba(255,255,255,.15)' : 'rgba(255,255,255,.07)'}`,
        boxShadow: hovered ? `0 16px 40px ${glow}, 0 4px 12px rgba(0,0,0,.4)` : '0 4px 20px rgba(0,0,0,.35)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all .3s cubic-bezier(.4,0,.2,1)',
      }}
    >
      {/* Background image */}
      <img src={image} alt="" style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform .4s ease'
      }} />
      {/* Gradient */}
      <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,.92) 0%, rgba(0,0,0,.4) 55%, rgba(0,0,0,.1) 100%)' }}/>

      {/* Content */}
      <div style={{
        position: 'relative', inset: 0, padding: '1.25rem',
        height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', boxSizing: 'border-box'
      }}>
        {/* Price pill */}
        <div style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,.1)', borderRadius: '99px',
          padding: '.25rem .7rem', fontSize: '.65rem', fontWeight: 900, color: '#fff'
        }}>
          ${parseFloat(event.price || 0).toFixed(0)}
        </div>

        <h3 style={{ margin: '0 0 .25rem', fontSize: '.95rem', fontWeight: 900, color: '#fff',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          textShadow: '0 2px 8px rgba(0,0,0,.6)' }}>
          {event.name}
        </h3>
        <p style={{ margin: '0 0 .85rem', fontSize: '.65rem', color: 'rgba(255,255,255,.6)', fontWeight: 600 }}>
          {event.date ? new Date(event.date).toLocaleDateString('es-MX', { day:'numeric', month:'short', year:'numeric' }) : ''}
          {event.venue_name ? ` · ${event.venue_name}` : ''}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button onClick={onAdd} style={{
            flex: 1, background: adding ? '#22c55e' : '#fff', color: '#000',
            border: 'none', padding: '.55rem', borderRadius: '10px',
            fontSize: '.62rem', fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '1.5px', cursor: 'pointer', transition: 'all .25s'
          }}>
            {adding ? '✓ AGREGADO' : 'AGREGAR AL CARRITO'}
          </button>
          <button onClick={onView} style={{
            background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,.15)', color: '#fff',
            padding: '.55rem .85rem', borderRadius: '10px',
            fontSize: '.62rem', fontWeight: 900, cursor: 'pointer', transition: 'all .25s'
          }}>
            VER
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
