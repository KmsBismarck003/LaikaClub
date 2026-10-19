import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import TicketModal from './components/Wallet/TicketModal';
import CancelTicketModal from './components/Wallet/CancelTicketModal';
import TransferModal from '../../components/Transfer/TransferModal';
import { useTicketTransfer } from '../../hooks/useTicketTransfer';
import { useNotification } from '../../context/NotificationContext';
import Icon from '../../components/Icons/Icons';

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
  const [incomingTransfers, setIncomingTransfers] = useState([]);
  const [outgoingTransfers, setOutgoingTransfers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('upcoming');
  const [qrModal,  setQrModal]  = useState(null);
  const [cancelModalTicket, setCancelModalTicket] = useState(null);
  const navigate = useNavigate();
  const { success, error } = useNotification();

  const fetchTickets = async () => {
    try {
      const [respTickets, respIncoming, respOutgoing] = await Promise.all([
        api.ticket.getMyTickets().catch(() => []),
        transferAPI.getIncoming().catch(() => []),
        transferAPI.getOutgoing().catch(() => []),
      ]);
      setTickets(Array.isArray(respTickets) ? respTickets : []);
      setIncomingTransfers(Array.isArray(respIncoming) ? respIncoming : []);
      setOutgoingTransfers(Array.isArray(respOutgoing) ? respOutgoing : []);
    } catch {
      setTickets([]);
      setIncomingTransfers([]);
      setOutgoingTransfers([]);
    } finally { setLoading(false); }
  };

  const transfer = useTicketTransfer({ success, error, onComplete: fetchTickets });

  useEffect(() => {
    fetchTickets();
  }, []);

  const isCancelled = t => {
    const st = (t.status || '').toLowerCase();
    return st === 'cancelled' || st === 'refunded';
  };

  const isTransferred = t => {
    const st = (t.status || '').toLowerCase();
    return st === 'transferred';
  };

  const isUpcoming = t => {
    const d = t.event?.date || t.date;
    return (!d || new Date(d) >= new Date()) && !isCancelled(t) && !isTransferred(t);
  };

  const upcoming  = tickets.filter(t => isUpcoming(t));
  const past      = tickets.filter(t => !isCancelled(t) && !isTransferred(t) && !isUpcoming(t));
  const cancelled = tickets.filter(t => isCancelled(t) || isTransferred(t));

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
      {[1,2,3].map(i => <div key={i} style={{ height:'130px', borderRadius:'18px', background:'rgba(255,255,255,.04)' }}/>)}
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'2rem' }}>

      {/* ── BANNER DE TRANSFERENCIAS ENTRANTES PENDIENTES ────────── */}
      {incomingTransfers.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(124, 58, 237, 0.12))',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '16px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon name="swap" size={16} />
              </div>
              <span style={{ fontSize: '.75rem', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Transferencias Entrantes Pendientes ({incomingTransfers.length})
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {incomingTransfers.map(trf => (
              <div key={trf.id} style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 .25rem', fontSize: '.9rem', fontWeight: 900, color: '#fff' }}>
                    {trf.event_name || 'Evento LAIKA Club'}
                  </h4>
                  <p style={{ margin: '0 0 .2rem', fontSize: '.7rem', color: '#aaa' }}>
                    Remitente: <strong style={{ color: '#fff' }}>{trf.sender_email}</strong>
                  </p>
                  <p style={{ margin: 0, fontSize: '.65rem', color: '#666' }}>
                    Zona: {trf.section_name || 'General'} &bull; Expira: {trf.expires_at ? new Date(trf.expires_at).toLocaleDateString('es-MX', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '—'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '.6rem' }}>
                  <button
                    type="button"
                    onClick={() => transfer.acceptIncoming(trf.id)}
                    disabled={transfer.loading}
                    style={{
                      background: '#22c55e',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '.45rem 1rem',
                      fontSize: '.68rem',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      cursor: 'pointer',
                      transition: 'background .2s'
                    }}
                  >
                    Aceptar Boleto
                  </button>
                  <button
                    type="button"
                    onClick={() => transfer.rejectIncoming(trf.id)}
                    disabled={transfer.loading}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: '#aaa',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '.45rem 1rem',
                      fontSize: '.68rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      cursor: 'pointer'
                    }}
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <span style={{ fontSize:'.65rem', fontWeight:900, textTransform:'uppercase',
          letterSpacing:'4px', color:'#666' }}>MIS BOLETOS</span>

        <div style={{ display:'flex', background:'rgba(255,255,255,.06)',
          border:'1px solid rgba(255,255,255,.1)', borderRadius:'99px', padding:'4px', gap:'4px' }}>
          {[
            { id:'upcoming',  label:'PROXIMOS',   count: upcoming.length },
            { id:'past',      label:'PASADOS',    count: past.length },
            { id:'cancelled', label:'CANCELADOS / CEDIDOS', count: cancelled.length },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab===t.id ? '#fff' : 'transparent',
              color:      tab===t.id ? '#000' : '#666',
              border:'none', padding:'.4rem 1rem', borderRadius:'99px',
              fontSize:'.62rem', fontWeight:900, letterSpacing:'1.5px',
              cursor:'pointer', transition:'all .2s', display:'flex', alignItems:'center', gap:'.45rem'
            }}>
              <span>{t.label}</span>
              {t.count > 0 && (
                <span style={{
                  fontSize:'.52rem', fontWeight:900, padding:'1px 5px', borderRadius:'99px',
                  background: tab===t.id ? '#000' : 'rgba(255,255,255,.1)',
                  color: tab===t.id ? '#fff' : '#888'
                }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── UPCOMING ────────────────────────────────────────────── */}
      {tab === 'upcoming' && (
        upcoming.length === 0 ? (
          <Empty onExplore={() => navigate('/')} msg="No tienes eventos próximos activos" />
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {upcoming.map((t, i) => (
              <BigTicketCard key={t.id||i} ticket={t} idx={i}
                outgoingTransfers={outgoingTransfers}
                onQr={() => setQrModal(t)}
                onTransfer={transfer.openTransfer}
                onCancelTransfer={trfId => transfer.cancelOutgoing(trfId)}
                onCancel={tkt => setCancelModalTicket(tkt)} />
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
                onTransfer={transfer.openTransfer}
                onCancel={tkt => setCancelModalTicket(tkt)} />
            ))}
          </div>
        )
      )}

      {/* ── CANCELLED ───────────────────────────────────────────── */}
      {tab === 'cancelled' && (
        cancelled.length === 0 ? (
          <Empty msg="No tienes boletos cancelados" />
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {cancelled.map((t, i) => (
              <BigTicketCard key={t.id||i} ticket={t} idx={i}
                isCancelled onNavigateToRefunds={() => navigate('/user/refunds')} />
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
        recipientEmail={transfer.recipientEmail}
        setRecipientEmail={transfer.setRecipientEmail}
        password={transfer.password}
        setPassword={transfer.setPassword}
        transferData={transfer.transferData}
        claimUrl={transfer.claimUrl}
        secondsLeft={transfer.secondsLeft}
        errorMsg={transfer.errorMsg}
        loading={transfer.loading}
        onConfirm={transfer.confirmAndSend}
        onCancel={transfer.cancelTransferModal}
      />

      {/* ── CANCEL TICKET MODAL ─────────────────────────────────── */}
      {cancelModalTicket && (
        <CancelTicketModal
          ticket={cancelModalTicket}
          onClose={() => setCancelModalTicket(null)}
          onSuccess={() => {
            fetchTickets();
          }}
        />
      )}
    </div>
  );
}

/* ── BIG TICKET CARD (Proximos + Pasados full + Cancelados) ──── */
function BigTicketCard({
  ticket,
  idx,
  isPast,
  isCancelled,
  outgoingTransfers,
  onQr,
  onTransfer,
  onCancelTransfer,
  onCancel,
  onNavigateToRefunds
}) {
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

  const isTransferPending = status === 'transfer_pending';
  const isTransferred = status === 'transferred';
  const isCancelledTicket = isCancelled || status === 'cancelled' || status === 'refunded' || isTransferred;

  const badgeMap = {
    active:           { label:'ACTIVO',           color:'#fff', bg:'#22c55e' },
    confirmed:        { label:'CONFIRMADO',       color:'#fff', bg:'#3b82f6' },
    used:             { label:'USADO',            color:'#fff', bg:'#444'    },
    cancelled:        { label:'CANCELADO',        color:'#fff', bg:'#ef4444' },
    refunded:         { label:'REEMBOLSO',        color:'#fff', bg:'#f97316' },
    transfer_pending: { label:'EN TRANSFERENCIA', color:'#fff', bg:'#f59e0b' },
    transferred:      { label:'TRANSFERIDO',      color:'#fff', bg:'#64748b' },
  };
  const badgeDef = badgeMap[status] || (isCancelledTicket ? (isTransferred ? badgeMap.transferred : badgeMap.cancelled) : badgeMap.confirmed);

  const badgeFinal = isTransferPending
    ? badgeMap.transfer_pending
    : isCancelledTicket
      ? (status === 'refunded' ? badgeMap.refunded : isTransferred ? badgeMap.transferred : badgeMap.cancelled)
      : (status==='confirmed' && dateRaw && new Date(dateRaw) > new Date())
        ? { label:'PROXIMO', color:'#fff', bg:'#3b82f6' }
        : badgeDef;

  const canTransfer = (status === 'active' || status === 'confirmed') && !isPast && !isCancelledTicket && !isTransferPending;

  const outTrf = outgoingTransfers?.find(ot => ot.ticket_id === ticket.id);

  return (
    <div style={{
      display:'flex', flexDirection:'column',
      background: isCancelledTicket ? 'rgba(239, 68, 68, .03)' : isTransferPending ? 'rgba(245, 158, 11, .03)' : isPast ? 'rgba(255,255,255,.03)' : '#111115',
      border: isCancelledTicket ? '1px solid rgba(239, 68, 68, .25)' : isTransferPending ? '1px solid rgba(245, 158, 11, .25)' : `1px solid ${isPast ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.1)'}`,
      borderRadius:'18px', overflow:'hidden',
      filter: isCancelledTicket ? 'grayscale(.85) opacity(.7)' : isPast ? 'grayscale(.7) opacity(.7)' : 'none',
      boxShadow: isPast || isCancelledTicket ? 'none' : `0 6px 32px rgba(0,0,0,.4)`,
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

        {/* RIGHT QR / REVOKED / PENDING AREA */}
        {isCancelledTicket ? (
          <div
            style={{
              width:'120px', flexShrink:0,
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:'.4rem', padding:'0 .75rem', cursor:'not-allowed',
              background: isTransferred ? 'rgba(100, 116, 139, 0.04)' : 'rgba(239, 68, 68, 0.04)'
            }}
          >
            <div style={{
              width:'72px', height:'72px', borderRadius:'8px',
              border: `1px dashed ${isTransferred ? 'rgba(100, 116, 139, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
              background:'rgba(20, 10, 10, 0.9)',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              color: isTransferred ? '#94a3b8' : '#ef4444', gap:'.2rem'
            }}>
              <Icon name={isTransferred ? 'swap' : 'close'} size={22} color={isTransferred ? '#94a3b8' : '#ef4444'} />
              <span style={{ fontSize:'.48rem', fontWeight:900, letterSpacing:'1px', textTransform:'uppercase' }}>
                {isTransferred ? 'CEDIDO' : 'ANULADO'}
              </span>
            </div>
            <p style={{ margin:0, fontFamily:'monospace', fontSize:'.46rem',
              color: isTransferred ? '#94a3b8' : '#ef4444', letterSpacing:'1px', textAlign:'center',
              textDecoration:'line-through',
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'100%' }}>
              {code}
            </p>
          </div>
        ) : isTransferPending ? (
          <div
            style={{
              width:'120px', flexShrink:0,
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:'.4rem', padding:'0 .75rem', cursor:'not-allowed',
              background: 'rgba(245, 158, 11, 0.04)'
            }}
          >
            <div style={{
              width:'72px', height:'72px', borderRadius:'8px',
              border: '1px dashed rgba(245, 158, 11, 0.4)',
              background:'rgba(25, 20, 10, 0.9)',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              color:'#f59e0b', gap:'.2rem'
            }}>
              <Icon name="clock" size={22} color="#f59e0b" />
              <span style={{ fontSize:'.44rem', fontWeight:900, letterSpacing:'1px', textTransform:'uppercase' }}>
                EN ESPERA
              </span>
            </div>
            <p style={{ margin:0, fontFamily:'monospace', fontSize:'.46rem',
              color:'#f59e0b', letterSpacing:'1px', textAlign:'center',
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'100%' }}>
              {code}
            </p>
          </div>
        ) : (
          <div onClick={e => { e.stopPropagation(); onQr && onQr(); }}
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
        )}
      </div>

      {/* ACTION BAR */}
      {isCancelledTicket ? (
        <div style={{
          borderTop: `1px solid ${isTransferred ? 'rgba(100,116,139,.15)' : 'rgba(239,68,68,.15)'}`,
          padding: '.6rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: isTransferred ? 'rgba(100,116,139,.04)' : 'rgba(239,68,68,.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', color: isTransferred ? '#94a3b8' : '#ef4444', fontSize: '.65rem', fontWeight: 700 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isTransferred ? '#94a3b8' : '#ef4444' }} />
            <span>
              {isTransferred
                ? 'Boleto transferido • Acceso cedido y credencial revocada'
                : 'Boleto cancelado • Acceso revocado en recinto'}
            </span>
          </div>
          {onNavigateToRefunds && !isTransferred && (
            <button
              type="button"
              onClick={onNavigateToRefunds}
              style={{
                background: 'rgba(255,255,255,.06)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,.15)',
                borderRadius: '8px',
                padding: '.35rem .85rem',
                fontSize: '.62rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'all .2s'
              }}
            >
              Ver en Reembolsos
            </button>
          )}
        </div>
      ) : isTransferPending ? (
        <div style={{
          borderTop: '1px solid rgba(245, 158, 11, .2)',
          padding: '.6rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(245, 158, 11, .05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', color: '#f59e0b', fontSize: '.65rem', fontWeight: 700 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
            <span>
              {outTrf
                ? `Transferencia pendiente enviada a: ${outTrf.recipient_email}`
                : 'Boleto congelado: Transferencia pendiente de aceptación'}
            </span>
          </div>

          {outTrf && onCancelTransfer && (
            <button
              type="button"
              onClick={() => onCancelTransfer(outTrf.id)}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '.35rem .85rem',
                fontSize: '.62rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'all .2s'
              }}
            >
              Cancelar Envío
            </button>
          )}
        </div>
      ) : (
        /* ACTION BUTTONS — Transfer and Cancel visible only for active tickets */
        !isPast && (status === 'active' || status === 'confirmed') && (
          <div style={{
            borderTop: '1px solid rgba(255,255,255,.06)',
            padding: '.6rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0,0,0,.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', color: '#666', fontSize: '.65rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
              <span>Asiento: {ticket.seat_id || ticket.seatId || 'General'}</span>
            </div>

            <div style={{ display: 'flex', gap: '.6rem' }}>
              {canTransfer && (
                <button
                  type="button"
                  onClick={() => onTransfer(ticket)}
                  style={{
                    background: 'rgba(255,255,255,.06)',
                    color: '#ccc',
                    border: '1px solid rgba(255,255,255,.12)',
                    borderRadius: '8px',
                    padding: '.35rem .85rem',
                    fontSize: '.62rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    transition: 'all .2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,.06)'}
                >
                  Transferir
                </button>
              )}

              <button
                type="button"
                onClick={() => onCancel(ticket)}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '8px',
                  padding: '.35rem .85rem',
                  fontSize: '.62rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  transition: 'all .2s'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#ef4444';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                  e.currentTarget.style.color = '#ef4444';
                }}
              >
                Solicitar Cancelación
              </button>
            </div>
          </div>
        )
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
  const isCancelled = ticket.status === 'cancelled' || ticket.status === 'refunded';

  return (
    <div style={{
      display:'flex', height:'88px',
      background:'rgba(255,255,255,.03)',
      border: isCancelled ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(255,255,255,.06)',
      borderRadius:'14px', overflow:'hidden',
      filter: isCancelled ? 'grayscale(.85) opacity(.6)' : 'grayscale(.65) opacity(.75)'
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

      <div
        onClick={e => {
          e.stopPropagation();
          if (!isCancelled && onQr) onQr();
        }}
        style={{
          width:'72px', flexShrink:0, position:'relative',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          padding:'0 .5rem', gap:'.3rem', cursor: isCancelled ? 'not-allowed' : 'pointer'
        }}
      >
        <div style={{ width:'42px', height:'42px', overflow:'hidden', borderRadius:'6px', background:'#111', display:'flex', alignItems:'center', justifyContent:'center' }}>
          {isCancelled ? (
            <Icon name="close" size={20} color="#ef4444" />
          ) : (
            <img src={qr(code)} alt="QR" style={{ width:'100%', height:'100%' }}/>
          )}
        </div>
        <span style={{
          fontSize:'.45rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'1px',
          background: isCancelled ? 'rgba(239,68,68,.2)' : 'rgba(60,60,60,.9)',
          color: isCancelled ? '#ef4444' : '#888',
          padding:'.18rem .5rem', borderRadius:'99px',
          border: isCancelled ? '1px solid rgba(239,68,68,.3)' : '1px solid rgba(255,255,255,.08)'
        }}>
          {isCancelled ? 'ANULADO' : 'USADO'}
        </span>
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
