import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../components/Icons';

export function SectionLabel({ children }) {
  return (
    <p style={{ margin: '0 0 .75rem', fontSize: '.62rem', fontWeight: 900,
      textTransform: 'uppercase', letterSpacing: '3px', color: '#444' }}>
      {children}
    </p>
  );
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80',
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&q=80',
  'https://images.unsplash.com/photo-1501386761578-eaa54b618547?w=600&q=80',
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&q=80',
];

const NextEventHero = ({ nextTicket, daysUntil }) => {
  const navigate = useNavigate();

  if (!nextTicket) {
    return (
      <div style={{
        background: 'rgba(0,112,243,.06)', border: '1px dashed rgba(0,112,243,.25)',
        borderRadius: '20px', padding: '2.5rem', textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,.2)'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '.75rem' }}>🎟</div>
        <h3 style={{ margin: '0 0 .5rem', fontSize: '1rem', fontWeight: 900, color: '#fff',
          textTransform: 'uppercase', letterSpacing: '2px' }}>
          ¡Tu primera aventura te espera!
        </h3>
        <p style={{ margin: '0 0 1.25rem', fontSize: '.78rem', color: '#555' }}>
          Descubre eventos increíbles y compra tu primer boleto LAIKA
        </p>
        <button onClick={() => navigate('/')} style={{
          background: '#fff', color: '#000', border: 'none',
          padding: '.7rem 2rem', borderRadius: '99px',
          fontSize: '.65rem', fontWeight: 900, textTransform: 'uppercase',
          letterSpacing: '2px', cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(255,255,255,.1)'
        }}>Explorar Eventos</button>
      </div>
    );
  }

  return (
    <div>
      <SectionLabel>Tu próximo evento</SectionLabel>
      <div style={{
        position: 'relative', borderRadius: '20px', overflow: 'hidden',
        height: '242px', cursor: 'pointer',
        boxShadow: '0 12px 40px rgba(0,0,0,.6)',
        border: '1px solid rgba(255,255,255,.08)',
      }} onClick={() => navigate('/user/tickets')}>
        {/* BG Image */}
        <img
          src={nextTicket.event?.image_url || nextTicket.imageUrl || FALLBACK_IMAGES[0]}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(0,0,0,.85) 0%, rgba(0,0,0,.4) 60%, rgba(0,0,0,.1) 100%)' }}/>

        {/* Content */}
        <div style={{ position: 'relative', padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: '0 0 .3rem', fontSize: '.58rem', fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '3px', color: 'rgba(255,255,255,.5)' }}>Tu próxima experiencia</p>
              <h2 style={{ margin: '0 0 .4rem', fontSize: '1.65rem', fontWeight: 900, color: '#fff',
                textShadow: '0 2px 8px rgba(0,0,0,.5)' }}>
                {nextTicket.event?.name || nextTicket.eventName || 'Evento'}
              </h2>
              <p style={{ margin: 0, fontSize: '.75rem', color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>
                📅 {nextTicket.event?.date ? new Date(nextTicket.event.date).toLocaleDateString('es-MX', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) : '—'}
                {nextTicket.event?.venue_name && ` · ${nextTicket.event.venue_name}`}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.75rem' }}>
              {/* Countdown */}
              {daysUntil !== null && (
                <div style={{
                  background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(0,112,243,.4)', borderRadius: '14px',
                  padding: '.75rem 1.25rem', textAlign: 'center',
                  boxShadow: '0 0 20px rgba(0,112,243,.2)'
                }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0070F3', lineHeight: 1 }}>
                    {daysUntil === 0 ? '¡HOY!' : daysUntil}
                  </div>
                  {daysUntil > 0 && <div style={{ fontSize: '.55rem', fontWeight: 900, textTransform: 'uppercase',
                    letterSpacing: '2px', color: 'rgba(255,255,255,.5)', marginTop: '.2rem' }}>DÍAS</div>}
                </div>
              )}
              <button style={{
                background: '#fff', color: '#000', border: 'none',
                padding: '.65rem 1.4rem', borderRadius: '10px',
                fontSize: '.65rem', fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '1.5px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '.4rem'
              }}>
                <Icon name="ticket" size={13} /> Ver mi boleto →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { NextEventHero, FALLBACK_IMAGES };
