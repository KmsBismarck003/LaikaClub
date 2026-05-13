import React from 'react';
import { ACCENTS, FALLBACK_IMGS, qr } from './constants';

export function BigTicketCard({ ticket, idx, isPast, onQr }) {
  const acc     = ACCENTS[idx % ACCENTS.length];
  const code    = ticket.ticket_code || ticket.ticketCode || `TKT-${String(ticket.id||idx).padStart(6,'0')}`;
  const name    = ticket.event?.name || ticket.eventName || 'Evento LAIKA';
  const dateRaw = ticket.event?.date || ticket.date;
  const venue   = ticket.event?.venue_name || ticket.venue || 'LAIKA ARENA';
  const imgUrl  = ticket.event?.image_url || ticket.imageUrl || FALLBACK_IMGS[idx % FALLBACK_IMGS.length];
  const status  = ticket.status || (dateRaw && new Date(dateRaw) < new Date() ? 'used' : 'confirmed');
  const fmtDate = dateRaw
    ? new Date(dateRaw).toLocaleDateString('es-MX', { day:'numeric', month:'short', year:'numeric' })
    : '—';

  const badgeMap = {
    active:    { label:'ACTIVO',     color:'#fff', bg:'#22c55e' },
    confirmed: { label:'CONFIRMADO', color:'#fff', bg:'#3b82f6' },
    used:      { label:'USADO',      color:'#fff', bg:'#444'    },
    cancelled: { label:'CANCELADO',  color:'#fff', bg:'#ef4444' },
    refunded:  { label:'REEMBOLSO',  color:'#fff', bg:'#f97316' },
  };
  const badgeDef = badgeMap[status] || badgeMap.confirmed;

  const badgeFinal = (status==='confirmed' && dateRaw && new Date(dateRaw) > new Date())
    ? { label:'PRÓXIMO', color:'#fff', bg:'#3b82f6' }
    : badgeDef;

  return (
    <div style={{
      display:'flex',
      background: isPast ? 'rgba(255,255,255,.03)' : '#111115',
      border:`1px solid ${isPast ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.1)'}`,
      borderRadius:'18px', overflow:'hidden',
      filter: isPast ? 'grayscale(.7) opacity(.7)' : 'none',
      boxShadow: isPast ? 'none' : `0 6px 32px rgba(0,0,0,.4)`,
      height: '130px'
    }}>
      <div style={{
        width: '130px', flexShrink:0, position:'relative',
        background: `linear-gradient(135deg, ${acc.from} 0%, ${acc.to} 100%)`,
        overflow:'hidden'
      }}>
        <div style={{ position:'absolute', inset:0,
          background:`radial-gradient(circle at 40% 50%, ${acc.line}40 0%, transparent 70%)` }}/>
        <img src={imgUrl} alt="" style={{
          position:'absolute', inset:0, width:'100%', height:'100%',
          objectFit:'cover', opacity:.55, mixBlendMode:'luminosity'
        }}/>
        <div style={{
          position:'absolute', inset:0,
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          <img src={imgUrl} alt="" style={{
            width:'76px', height:'76px', borderRadius:'12px',
            objectFit:'cover', boxShadow:'0 4px 16px rgba(0,0,0,.5)',
            border:'2px solid rgba(255,255,255,.15)', position:'relative', zIndex:1
          }}/>
        </div>
      </div>

      <div style={{
        flex:1, padding:'1.1rem 1.25rem',
        display:'flex', flexDirection:'column', justifyContent:'space-between',
        minWidth:0
      }}>
        <div>
          <h3 style={{ margin:'0 0 .25rem', fontSize:'1.1rem', fontWeight:900, color:'#fff',
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
            textTransform:'uppercase', letterSpacing:'.5px' }}>
            {name}
          </h3>
          <p style={{ margin:'0 0 .18rem', fontSize:'.7rem', color:'#666', fontWeight:600,
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {ticket.ticket_type ? `${ticket.ticket_type}, ` : ''}{venue}
          </p>
          <p style={{ margin:0, fontSize:'.68rem', color:'#555', fontWeight:600 }}>{fmtDate}</p>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <span style={{
            background: badgeFinal.bg, color: badgeFinal.color,
            fontSize:'.58rem', fontWeight:900, letterSpacing:'1.5px', textTransform:'uppercase',
            padding:'.3rem .85rem', borderRadius:'99px', alignSelf:'flex-end'
          }}>{badgeFinal.label}</span>
        </div>
      </div>

      <div style={{ width:'1px', background:'transparent',
        borderLeft:'2px dashed rgba(255,255,255,.08)',
        margin:'12px 0', flexShrink:0 }}/>

      <div onClick={e => { e.stopPropagation(); onQr(); }}
        style={{
          width:'120px', flexShrink:0,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          gap:'.5rem', padding:'0 1rem', cursor:'pointer',
          transition:'background .2s'
        }}
        onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,.03)'}
        onMouseOut={e => e.currentTarget.style.background='transparent'}
      >
        <div style={{ width:'72px', height:'72px', borderRadius:'8px', overflow:'hidden',
          border:'1px solid rgba(255,255,255,.1)', background:'#111' }}>
          <img src={qr(code)} alt="QR" style={{ width:'100%', height:'100%' }}/>
        </div>
        <p style={{ margin:0, fontFamily:'monospace', fontSize:'.48rem',
          color:'#555', letterSpacing:'1px', textAlign:'center',
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'100%' }}>
          {code}
        </p>
      </div>
    </div>
  );
}

export function SmallTicketCard({ ticket, idx, onQr }) {
  const acc  = ACCENTS[idx % ACCENTS.length];
  const code = ticket.ticket_code || ticket.ticketCode || `TKT-${String(ticket.id||idx).padStart(6,'0')}`;
  const name = ticket.event?.name || ticket.eventName || 'Evento';
  const dateRaw = ticket.event?.date || ticket.date;
  const venue   = ticket.event?.venue_name || ticket.venue || '';
  const imgUrl  = ticket.event?.image_url || ticket.imageUrl || FALLBACK_IMGS[idx % FALLBACK_IMGS.length];
  const fmtDate = dateRaw ? new Date(dateRaw).toLocaleDateString('es-MX',{day:'numeric',month:'short',year:'numeric'}) : '—';

  return (
    <div style={{
      display:'flex', height:'88px',
      background:'rgba(255,255,255,.03)',
      border:'1px solid rgba(255,255,255,.06)',
      borderRadius:'14px', overflow:'hidden',
      filter:'grayscale(.65) opacity(.75)'
    }}>
      <div style={{ width:'72px', flexShrink:0, position:'relative',
        background:`linear-gradient(135deg, ${acc.from} 0%, ${acc.to} 100%)` }}>
        <img src={imgUrl} alt="" style={{ position:'absolute', inset:0,
          width:'100%', height:'100%', objectFit:'cover', opacity:.5 }}/>
      </div>
      <div style={{ flex:1, padding:'.65rem .75rem', display:'flex', flexDirection:'column', justifyContent:'center', minWidth:0 }}>
        <h4 style={{ margin:'0 0 .15rem', fontSize:'.72rem', fontWeight:900, color:'#fff',
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</h4>
        <p style={{ margin:0, fontSize:'.6rem', color:'#555', fontWeight:600 }}>{venue && `${venue}, `}{fmtDate}</p>
      </div>
      <div onClick={e => { e.stopPropagation(); onQr(); }} style={{
        width:'72px', flexShrink:0, position:'relative',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        padding:'0 .5rem', gap:'.3rem', cursor:'pointer'
      }}>
        <div style={{ width:'42px', height:'42px', overflow:'hidden', borderRadius:'6px', background:'#111' }}>
          <img src={qr(code)} alt="QR" style={{ width:'100%', height:'100%' }}/>
        </div>
        <span style={{
          fontSize:'.45rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'1px',
          background:'rgba(60,60,60,.9)', color:'#888', padding:'.18rem .5rem', borderRadius:'99px',
          border:'1px solid rgba(255,255,255,.08)'
        }}>USADO</span>
      </div>
    </div>
  );
}

export function QrModalContent({ ticket, onClose }) {
  const idx  = 0;
  const acc  = ACCENTS[idx];
  const code = ticket.ticket_code || ticket.ticketCode || `TKT-${ticket.id||'000'}`;
  const name = ticket.event?.name || ticket.eventName || 'Evento';
  const dateRaw = ticket.event?.date || ticket.date;
  const venue   = ticket.event?.venue_name || ticket.venue || 'LAIKA ARENA';
  const fmtDate = dateRaw
    ? new Date(dateRaw).toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long',year:'numeric'})
    : '—';

  return (
    <div onClick={e=>e.stopPropagation()} style={{
      background:'#111', border:'1px solid rgba(255,255,255,.12)',
      borderRadius:'24px', padding:'2.5rem',
      display:'flex', flexDirection:'column', alignItems:'center', gap:'1.25rem',
      maxWidth:'340px', width:'90vw',
      boxShadow:`0 0 60px rgba(0,0,0,.6)`
    }}>
      <p style={{ margin:0, fontSize:'.58rem', fontWeight:900, textTransform:'uppercase',
        letterSpacing:'3px', color:'#666' }}>Tu Boleto Digital</p>
      <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:900, color:'#fff',
        textAlign:'center', textTransform:'uppercase' }}>{name}</h2>
      <div style={{ width:220, height:220, borderRadius:'16px', overflow:'hidden',
        border:'2px solid rgba(255,255,255,.15)' }}>
        <img src={qr(code)} alt="QR" style={{ width:'100%', height:'100%' }}/>
      </div>
      <p style={{ margin:0, fontFamily:'monospace', fontSize:'.72rem',
        color:'#888', letterSpacing:'2px' }}>{code}</p>
      <p style={{ margin:0, fontSize:'.65rem', color:'#555', fontWeight:600, textAlign:'center' }}>
        📅 {fmtDate}<br/>📍 {venue}
      </p>
      <button onClick={onClose} style={{ background:'rgba(255,255,255,.06)',
        border:'1px solid rgba(255,255,255,.1)', color:'#888',
        padding:'.5rem 1.5rem', borderRadius:'99px',
        fontSize:'.6rem', fontWeight:900, textTransform:'uppercase',
        letterSpacing:'1.5px', cursor:'pointer' }}>
        Cerrar
      </button>
    </div>
  );
}

export function Empty({ onExplore, msg }) {
  return (
    <div style={{ textAlign:'center', padding:'4rem 2rem',
      background:'rgba(255,255,255,.02)', border:'1px dashed rgba(255,255,255,.07)',
      borderRadius:'20px' }}>
      <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🎟</div>
      <p style={{ margin:'0 0 1.25rem', fontSize:'.8rem', color:'#555' }}>
        {msg || 'No tienes próximos eventos'}
      </p>
      {onExplore && (
        <button onClick={onExplore} style={{
          background:'#fff', color:'#000', border:'none',
          padding:'.65rem 2rem', borderRadius:'99px',
          fontSize:'.65rem', fontWeight:900, textTransform:'uppercase',
          letterSpacing:'2px', cursor:'pointer'
        }}>Explorar Eventos</button>
      )}
    </div>
  );
}
