import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import TicketModal from './components/Wallet/TicketModal';
import TransferModal from '../../components/Transfer/TransferModal';
import { useTicketTransfer } from '../../hooks/useTicketTransfer';
import { useNotification } from '../../context/NotificationContext';

/* ── Accent colors per index ─────────────────────────────────── */
const ACCENTS = [
  { from: '#0d2a6b', to: '#0a1a4a', line: '#0070F3', badge: '#0070F3' },
  { from: '#2d1060', to: '#1a0a3a', line: '#7928CA', badge: '#7928CA' },
  { from: '#4a1a00', to: '#2a0f00', line: '#f97316', badge: '#f97316' },
  { from: '#4a0d2a', to: '#2a0a1a', line: '#ec4899', badge: '#ec4899' },
  { from: '#0a3a1a', to: '#062211', line: '#22c55e', badge: '#22c55e' },
  { from: '#3a2a00', to: '#1f1500', line: '#eab308', badge: '#eab308' },
];

const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&q=80',
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=200&q=80',
  'https://images.unsplash.com/photo-1501386761578-eaa54b618547?w=200&q=80',
];

function qr(code) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(code)}&qzone=1&color=cccccc&bgcolor=111111`;
}

function getEventImageUrl(url, idx = 0) {
  if (!url) return FALLBACK_IMGS[idx % FALLBACK_IMGS.length];
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const host = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : `http://${window.location.hostname}:8000`;
  if (url.startsWith('/')) {
    return `${host}${url}`;
  }
  return `${host}/${url}`;
}

export default function UserWallet() {
  const [tickets,  setTickets]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('upcoming');
  const [qrModal,  setQrModal]  = useState(null);
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const transfer = useTicketTransfer({ success, error });

  useEffect(() => {
    (async () => {
      try {
        const resp = await api.ticket.getMyTickets();
        setTickets(Array.isArray(resp) ? resp : []);
      } catch {
        setTickets([]);
      } finally { setLoading(false); }
    })();
  }, []);

  const isUpcoming = t => {
    const d = t.event?.date || t.date;
    return !d || new Date(d) >= new Date();
  };

  const upcoming = tickets.filter(isUpcoming);
  const past     = tickets.filter(t => !isUpcoming(t));

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
      {[1,2,3].map(i => <div key={i} style={{ height:'130px', borderRadius:'18px', background:'rgba(255,255,255,.04)' }}/>)}
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'2rem' }}>

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'.65rem', fontWeight:900, textTransform:'uppercase',
          letterSpacing:'4px', color:'#666' }}>MIS BOLETOS</span>

        <div style={{ display:'flex', background:'rgba(255,255,255,.06)',
          border:'1px solid rgba(255,255,255,.1)', borderRadius:'99px', padding:'4px' }}>
          {[
            { id:'upcoming', label:'PROXIMOS' },
            { id:'past',     label:'PASADOS'  },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab===t.id ? '#fff' : 'transparent',
              color:      tab===t.id ? '#000' : '#555',
              border:'none', padding:'.4rem 1.1rem', borderRadius:'99px',
              fontSize:'.62rem', fontWeight:900, letterSpacing:'1.5px',
              cursor:'pointer', transition:'all .2s'
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── UPCOMING ────────────────────────────────────────────── */}
      {tab === 'upcoming' && (
        upcoming.length === 0 ? (
          <Empty onExplore={() => navigate('/')} />
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {upcoming.map((t, i) => (
              <BigTicketCard key={t.id||i} ticket={t} idx={i}
                onQr={() => setQrModal(t)}
                onTransfer={transfer.openTransfer} />
            ))}
          </div>
        )
      )}

      {/* ── PAST ───────────────────────────────────────────────── */}
      {tab === 'past' && (
        past.length === 0 ? (
          <Empty msg="Sin eventos pasados" />
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {past.map((t, i) => (
              <BigTicketCard key={t.id||i} ticket={t} idx={i}
                isPast onQr={() => setQrModal(t)}
                onTransfer={transfer.openTransfer} />
            ))}
          </div>
        )
      )}

      {/* ── EVENTOS PASADOS section (always shown on upcoming tab) ─ */}
      {tab === 'upcoming' && past.length > 0 && (
        <div>
          <p style={{ margin:'0 0 .75rem', fontSize:'.58rem', fontWeight:900,
            textTransform:'uppercase', letterSpacing:'3.5px', color:'#333',
            paddingBottom:'.75rem', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
            Eventos Pasados
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem' }}>
            {past.slice(0, 4).map((t, i) => (
              <SmallTicketCard key={t.id||i} ticket={t} idx={i} onQr={() => setQrModal(t)} />
            ))}
          </div>
        </div>
      )}

      {/* ── QR MODAL ────────────────────────────────────────────── */}
      {qrModal && (
        <div onClick={() => setQrModal(null)} style={{
          position:'fixed', inset:0, zIndex:9999,
          background:'rgba(0,0,0,.92)', backdropFilter:'blur(20px)',
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          <TicketModal ticket={qrModal} onClose={() => setQrModal(null)} />
        </div>
      )}

      {/* ── TRANSFER MODAL ───────────────────────────────────────── */}
      <TransferModal
        phase={transfer.phase}
        ticket={transfer.ticket}
        password={transfer.password}
        setPassword={transfer.setPassword}
        tokenData={transfer.tokenData}
        claimUrl={transfer.claimUrl}
        secondsLeft={transfer.secondsLeft}
        errorMsg={transfer.errorMsg}
        loading={transfer.loading}
        onConfirm={transfer.confirmAndGenerate}
        onCancel={transfer.cancelTransfer}
      />
    </div>
  );
}

/* ── BIG TICKET CARD (Proximos + Pasados full) ───────────────── */
function BigTicketCard({ ticket, idx, isPast, onQr, onTransfer }) {
  const acc     = ACCENTS[idx % ACCENTS.length];
  const code    = ticket.ticket_code || ticket.ticketCode || `TKT-${String(ticket.id||idx).padStart(6,'0')}`;
  const name    = ticket.event?.name || ticket.eventName || 'Evento LAIKA';
  const dateRaw = ticket.event?.date || ticket.date;
  const venue   = ticket.event?.venue_name || ticket.venue || 'LAIKA ARENA';
  const imgUrl  = getEventImageUrl(ticket.event?.image_url || ticket.imageUrl, idx);
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
    ? { label:'PROXIMO', color:'#fff', bg:'#3b82f6' }
    : badgeDef;

  const canTransfer = (status === 'active' || status === 'confirmed') && !isPast;

  return (
    <div style={{
      display:'flex', flexDirection:'column',
      background: isPast ? 'rgba(255,255,255,.03)' : '#111115',
      border:`1px solid ${isPast ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.1)'}`,
      borderRadius:'18px', overflow:'hidden',
      filter: isPast ? 'grayscale(.7) opacity(.7)' : 'none',
      boxShadow: isPast ? 'none' : `0 6px 32px rgba(0,0,0,.4)`,
    }}>

      {/* Main ticket row */}
      <div style={{ display:'flex', height:'130px' }}>

        {/* LEFT COLORED PANEL */}
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

        {/* CENTER INFO */}
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

        {/* PERFORATION */}
        <div style={{ width:'1px', background:'transparent',
          borderLeft:'2px dashed rgba(255,255,255,.08)',
          margin:'12px 0', flexShrink:0 }}/>

        {/* RIGHT QR */}
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

      {/* TRANSFER BUTTON — visible only for active tickets */}
      {canTransfer && (
        <div style={{ borderTop:'1px solid rgba(255,255,255,.05)', padding:'.6rem 1rem' }}>
          <button
            id={`transfer-btn-${ticket.id || idx}`}
            onClick={e => { e.stopPropagation(); onTransfer(ticket); }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '.55rem 1rem',
              background: 'rgba(121,40,202,.08)',
              border: '1px solid rgba(121,40,202,.18)',
              borderRadius: '10px',
              color: '#a78bfa',
              fontSize: '.62rem',
              fontWeight: 800,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all .2s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'rgba(121,40,202,.16)';
              e.currentTarget.style.borderColor = 'rgba(121,40,202,.32)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(121,40,202,.08)';
              e.currentTarget.style.borderColor = 'rgba(121,40,202,.18)';
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Transferir Boleto
          </button>
        </div>
      )}
    </div>
  );
}

/* ── SMALL TICKET CARD (grid 2-col past events) ─────────────── */
function SmallTicketCard({ ticket, idx, onQr }) {
  const acc  = ACCENTS[idx % ACCENTS.length];
  const code = ticket.ticket_code || ticket.ticketCode || `TKT-${String(ticket.id||idx).padStart(6,'0')}`;
  const name = ticket.event?.name || ticket.eventName || 'Evento';
  const dateRaw = ticket.event?.date || ticket.date;
  const venue   = ticket.event?.venue_name || ticket.venue || '';
  const imgUrl  = getEventImageUrl(ticket.event?.image_url || ticket.imageUrl, idx);
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

/* ── EMPTY STATE ────────────────────────────────────────────── */
function Empty({ onExplore, msg }) {
  return (
    <div style={{ textAlign:'center', padding:'4rem 2rem',
      background:'rgba(255,255,255,.02)', border:'1px dashed rgba(255,255,255,.07)',
      borderRadius:'20px' }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom:'1rem', display:'block', margin:'0 auto 1rem' }}>
        <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
      </svg>
      <p style={{ margin:'0 0 1.25rem', fontSize:'.8rem', color:'#555' }}>
        {msg || 'No tienes proximos eventos'}
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
