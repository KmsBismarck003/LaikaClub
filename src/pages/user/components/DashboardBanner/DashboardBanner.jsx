import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../components/Icons';

const DashboardBanner = ({ firstName, tier, cartCount, openCart }) => {
  const navigate = useNavigate();
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0d1b2a 0%, #0f0c29 50%, #24243e 100%)',
      border: '1px solid rgba(255,255,255,.07)',
      borderRadius: '22px',
      padding: '2.5rem 2.75rem',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 8px 40px rgba(0,0,0,.5)',
    }}>
      {/* orbs */}
      <div style={{ position:'absolute', top:'-40px', right:'60px', width:'220px', height:'220px',
        background:'radial-gradient(circle, rgba(0,112,243,.2) 0%, transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:'-60px', left:'30px', width:'160px', height:'160px',
        background:'radial-gradient(circle, rgba(121,40,202,.15) 0%, transparent 70%)', pointerEvents:'none' }}/>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', position: 'relative' }}>
        <div>
          <p style={{ margin: '0 0 .35rem', fontSize: '.62rem', fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '3px', color: '#555' }}>Bienvenido de vuelta</p>
          <h1 style={{ margin: '0 0 .75rem', fontSize: '2.2rem', fontWeight: 900, color: '#fff' }}>
            ¡Hola, {firstName}! 👋
          </h1>
          <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '.35rem',
              background: `${tier.color}18`, border: `1px solid ${tier.color}40`,
              color: tier.color, fontSize: '.62rem', fontWeight: 900,
              letterSpacing: '2px', textTransform: 'uppercase',
              padding: '.3rem .85rem', borderRadius: '99px'
            }}>
              {tier.emoji} Nivel {tier.label}
            </span>
            {cartCount > 0 && (
              <button onClick={openCart} style={{
                display: 'inline-flex', alignItems: 'center', gap: '.4rem',
                background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                color: '#fff', fontSize: '.62rem', fontWeight: 900,
                letterSpacing: '1.5px', textTransform: 'uppercase',
                padding: '.3rem .85rem', borderRadius: '99px', cursor: 'pointer',
                transition: 'all .2s'
              }}>
                <Icon name="shoppingCart" size={12} /> {cartCount} en carrito
              </button>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: '.6rem' }}>
          <button onClick={() => navigate('/user/tickets')} style={{
            background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
            color: '#fff', padding: '.6rem 1.25rem', borderRadius: '12px',
            fontSize: '.65rem', fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '1.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.4rem',
            transition: 'all .2s'
          }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,.06)'}
          >
            <Icon name="ticket" size={13} /> Mis Boletos
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardBanner;
