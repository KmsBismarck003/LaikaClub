/**
 * TICKET TEMPLATE — V3
 * Vista horizontal (apaisada): imagen a la izquierda, info a la derecha
 * con el QR en la franja lateral derecha, separador de perforación vertical.
 *
 * Props: { ticket, onClose }
 * Para una nueva versión: copia bol_v3/ → bol_vN/, edita y registra
 * en TicketModal.jsx.
 */
import React from 'react';
import { qr, getEventImageUrl, ACCENTS } from '../constants';
import { formatDate, formatTime, getSeatLabel } from '../../../../EventDetail/utils/helpers';

export default function TicketV3({ ticket, onClose }) {
  const code        = ticket.ticket_code || ticket.ticketCode || `TKT-${ticket.id || '000'}`;
  const name        = ticket.event?.name  || ticket.eventName  || 'Evento';
  const dateRaw     = ticket.event?.date  || ticket.date;
  const timeRaw     = ticket.event?.time  || ticket.time || ticket.event_time || 'N/A';
  const venue       = ticket.event?.venue_name || ticket.venue || 'LAIKA ARENA';
  const imgUrl      = getEventImageUrl(ticket.event?.image_url || ticket.imageUrl);
  const seatId      = ticket.seat_id || ticket.seatId;
  const sectionName = ticket.section_name || ticket.sectionName || 'General';
  const seatLabel   = seatId ? getSeatLabel(seatId, ticket.event) : null;
  const fmtDate     = dateRaw   ? formatDate(dateRaw)  : 'POR CONFIRMAR';
  const fmtTime     = timeRaw !== 'N/A' ? formatTime(timeRaw) : '';

  /* Color accent — usa el primer acento (púrpura) como predeterminado */
  const acc = ACCENTS[1]; // #7928CA

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        display:      'flex',
        flexDirection:'column',
        gap:          '0.75rem',
        maxWidth:     '580px',
        width:        '92vw',
      }}
    >
      {/* ── TARJETA HORIZONTAL ────────────────────────────────── */}
      <div style={{
        display:       'flex',
        borderRadius:  '20px',
        overflow:      'hidden',
        border:        '1px solid rgba(255,255,255,0.11)',
        boxShadow:     '0 24px 60px -10px rgba(0,0,0,0.9), 0 0 40px rgba(121,40,202,0.12)',
        height:        '190px',
        background:    '#0c0b12',
      }}>

        {/* SECCIÓN A — Imagen del evento */}
        <div style={{
          width:'180px', flexShrink:0, position:'relative',
          background:`linear-gradient(135deg, ${acc.from} 0%, ${acc.to} 100%)`,
          overflow:'hidden',
        }}>
          {/* Logo overlay */}
          <img
            src="/logob.png"
            alt="LAIKA Club Logo"
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              height: '14px',
              width: 'auto',
              zIndex: 2,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
              pointerEvents: 'none',
            }}
          />
          {/* Glow */}
          <div style={{
            position:'absolute', inset:0,
            background:`radial-gradient(circle at 40% 50%, ${acc.line}40 0%, transparent 70%)`,
          }}/>
          {/* Imagen real */}
          <img src={imgUrl} alt="" style={{
            position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', opacity:0.75,
          }}/>
          {/* Overlay de texto inferior */}
          <div style={{
            position:'absolute', bottom:0, left:0, right:0,
            padding:'0.6rem 0.75rem',
            background:'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
          }}>
            <span style={{
              fontSize:'0.45rem', fontWeight:900, textTransform:'uppercase',
              letterSpacing:'3px', color:'rgba(192,132,252,0.9)',
            }}>BOLETO DIGITAL</span>
          </div>
        </div>

        {/* SECCIÓN B — Información del evento */}
        <div style={{
          flex:1, padding:'1.1rem 1.2rem',
          display:'flex', flexDirection:'column', justifyContent:'space-between',
          minWidth:0,
        }}>
          {/* Nombre */}
          <div>
            <h2 style={{
              margin:'0 0 0.3rem', fontSize:'1rem', fontWeight:900, color:'#fff',
              textTransform:'uppercase', letterSpacing:'0.5px',
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
            }}>{name}</h2>
            <p style={{ margin:0, fontSize:'0.65rem', color:'#666', fontWeight:600 }}>{venue}</p>
          </div>

          {/* Grid compacto de metadatos */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem 1rem' }}>
            <MiniField label="FECHA"   value={fmtDate} />
            <MiniField label="HORARIO" value={fmtTime ? `${fmtTime} HRS` : '—'} />
            <MiniField label="ZONA"    value={sectionName} color="#C084FC" />
            <MiniField label="ASIENTO" value={seatLabel ? `ASIENTO ${seatLabel}` : 'GENERAL'}
              color={seatLabel ? '#4ADE80' : '#888'} />
          </div>
        </div>

        {/* Separador perforado vertical */}
        <div style={{
          width:'1px', borderLeft:'2px dashed rgba(255,255,255,0.07)',
          margin:'14px 0', flexShrink:0,
        }}/>

        {/* SECCIÓN C — QR + código */}
        <div style={{
          width:'110px', flexShrink:0,
          display:'flex', flexDirection:'column', alignItems:'center',
          justifyContent:'center', gap:'0.6rem', padding:'0 0.9rem',
          background:'rgba(255,255,255,0.015)',
        }}>
          <div style={{
            width:'76px', height:'76px', background:'#fff',
            borderRadius:'10px', padding:'4px', overflow:'hidden',
            boxShadow:'0 6px 20px rgba(0,0,0,0.5)',
          }}>
            <img src={qr(code)} alt="QR" style={{ width:'100%', height:'100%', display:'block' }}/>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.15rem' }}>
            <span style={{ fontSize:'0.42rem', color:'#444', fontWeight:800, letterSpacing:'1.5px' }}>CÓDIGO</span>
            <span style={{
              fontFamily:'monospace', fontSize:'0.52rem', color:'#DDD6FE',
              letterSpacing:'1.5px', fontWeight:700, textAlign:'center',
              wordBreak:'break-all', lineHeight:1.4,
            }}>{code}</span>
          </div>
        </div>
      </div>

      {/* ── BOTÓN CERRAR (fuera de la tarjeta) ────────────────── */}
      <button
        onClick={onClose}
        onMouseOver={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.color='#fff'; }}
        onMouseOut={e  => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='#aaa'; }}
        style={{
          background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
          color:'#aaa', padding:'0.65rem 2rem', borderRadius:'99px',
          fontSize:'0.65rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'2px',
          cursor:'pointer', transition:'all 0.2s', width:'100%', textAlign:'center',
        }}
      >
        Cerrar boleto
      </button>
    </div>
  );
}

/* ── Auxiliar compacto ───────────────────────────────────────── */
function MiniField({ label, value, color = '#ccc' }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.12rem' }}>
      <span style={{ fontSize:'0.45rem', color:'#444', fontWeight:800, letterSpacing:'1px' }}>{label}</span>
      <span style={{ fontSize:'0.68rem', color, fontWeight:700 }}>{value}</span>
    </div>
  );
}
