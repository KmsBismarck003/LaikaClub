/**
 * TICKET TEMPLATE — V2
 * Edición Coleccionista: la imagen del evento ocupa la zona hero, panel
 * translúcido inferior con la info, QR pequeño y sello "EDICIÓN DE
 * COLECCIONISTA" en esquina inferior derecha.
 *
 * Props: { ticket, onClose }
 * Para una nueva versión: copia bol_v2/ → bol_vN/, edita y registra
 * en TicketModal.jsx.
 */
import React from 'react';
import { qr, getEventImageUrl } from '../constants';
import { formatDate, formatTime, getSeatLabel } from '../../../../EventDetail/utils/helpers';

export default function TicketV2({ ticket, onClose }) {
  const code        = ticket.ticket_code || ticket.ticketCode || `TKT-${ticket.id || '000'}`;
  const name        = ticket.event?.name  || ticket.eventName  || 'Evento';
  const dateRaw     = ticket.event?.date  || ticket.date;
  const timeRaw     = ticket.event?.time  || ticket.time || ticket.event_time || 'N/A';
  const venue       = ticket.event?.venue_name || ticket.venue || 'LAIKA ARENA';
  const imgUrl      = getEventImageUrl(ticket.event?.image_url || ticket.imageUrl);
  const seatId      = ticket.seat_id || ticket.seatId;
  const sectionName = ticket.section_name || ticket.sectionName || 'Boleto General';
  const seatLabel   = seatId ? getSeatLabel(seatId, ticket.event) : null;
  const fmtDate     = dateRaw   ? formatDate(dateRaw)  : 'POR CONFIRMAR';
  const fmtTime     = timeRaw !== 'N/A' ? formatTime(timeRaw) : '';

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        display:       'flex',
        flexDirection: 'column',
        maxWidth:      '400px',
        width:         '90vw',
        borderRadius:  '24px',
        overflow:      'hidden',
        boxShadow:     '0 32px 80px -10px rgba(0,0,0,0.95), 0 0 50px rgba(121,40,202,0.2)',
        border:        '1px solid rgba(255,255,255,0.12)',
        position:      'relative',
        background:    '#0e0d14',
      }}
    >
      {/* ── ZONA HERO: imagen del evento ──────────────────────── */}
      <div style={{ position:'relative', width:'100%', aspectRatio:'3/2.3', flexShrink:0 }}>
        {/* Imagen real del evento */}
        <img
          src={imgUrl}
          alt={name}
          style={{
            position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', display:'block',
          }}
        />
        {/* Gradiente inferior para transición suave al panel */}
        <div style={{
          position:'absolute', inset:0,
          background:'linear-gradient(to bottom, rgba(0,0,0,0) 40%, #0e0d14 100%)',
        }}/>
        {/* Cabecera flotante */}
        <div style={{
          position:'absolute', top:0, left:0, right:0,
          padding:'1rem 1.2rem',
          background:'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)',
          display:'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          zIndex: 2,
        }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.15rem' }}>
            <span style={{
              fontSize:'0.58rem', fontWeight:900, textTransform:'uppercase',
              letterSpacing:'5px', color:'#C084FC',
              textShadow:'0 0 12px rgba(192,132,252,0.5)',
            }}>BOLETO DIGITAL</span>
            <h2 style={{
              margin:0, fontSize:'1.25rem', fontWeight:900, color:'#fff',
              lineHeight:1.1, textTransform:'uppercase', letterSpacing:'0.5px',
              textShadow:'0 2px 12px rgba(0,0,0,0.8)',
            }}>{name}</h2>
          </div>
          <img
            src="/logob.png"
            alt="LAIKA Club Logo"
            style={{
              height: '18px',
              width: 'auto',
              opacity: 0.9,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
            }}
          />
        </div>

        {/* Sello EDICIÓN DE COLECCIONISTA — esquina inferior derecha */}
        <CollectorStamp />
      </div>

      {/* ── PANEL INFERIOR con la info ────────────────────────── */}
      <div style={{
        padding:'1.25rem 1.4rem 1.5rem',
        display:'flex', flexDirection:'column', gap:'1rem',
        background:'#0e0d14',
      }}>
        {/* Grid info */}
        <div style={{
          display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.85rem',
          background:'rgba(255,255,255,0.03)',
          border:'1px solid rgba(255,255,255,0.07)',
          borderRadius:'16px', padding:'1rem 1.1rem',
        }}>
          <MetaField label="FECHA"   value={fmtDate} />
          <MetaField label="HORARIO" value={fmtTime ? `${fmtTime} horas` : '—'} />
          <MetaField label="LUGAR"   value={venue} span={2} />
          <MetaField label="ZONA"    value={sectionName} color="#C084FC" bold />
          <MetaField label="ASIENTO" value={seatLabel ? `ASIENTO ${seatLabel}` : 'GENERAL'}
            color={seatLabel ? '#4ADE80' : '#888'} bold />
        </div>

        {/* Fila QR + código */}
        <div style={{
          display:'flex', alignItems:'center', gap:'1rem',
          background:'rgba(255,255,255,0.03)',
          border:'1px solid rgba(255,255,255,0.07)',
          borderRadius:'16px', padding:'0.85rem 1rem',
        }}>
          {/* QR pequeño */}
          <div style={{
            width:'72px', height:'72px', flexShrink:0,
            background:'#fff', borderRadius:'10px',
            padding:'4px', boxShadow:'0 4px 16px rgba(0,0,0,0.5)',
          }}>
            <img src={qr(code)} alt="QR" style={{ width:'100%', height:'100%', display:'block' }}/>
          </div>
          {/* Código de acceso */}
          <div style={{ display:'flex', flexDirection:'column', gap:'0.2rem' }}>
            <span style={{ fontSize:'0.5rem', color:'#555', fontWeight:800, letterSpacing:'2px' }}>CÓDIGO DE ACCESO</span>
            <span style={{
              fontFamily:'monospace', fontSize:'1rem',
              color:'#DDD6FE', letterSpacing:'3px', fontWeight:700,
            }}>{code}</span>
          </div>
        </div>

        {/* Botón cerrar */}
        <CloseButton onClose={onClose} />
      </div>
    </div>
  );
}

/* ── Sello decorativo coleccionista ─────────────────────────── */
function CollectorStamp() {
  return (
    <div style={{
      position:'absolute', bottom:'1.2rem', right:'1rem',
      width:'70px', height:'70px',
      border:'2px solid rgba(255,200,80,0.8)',
      borderRadius:'50%',
      display:'flex', alignItems:'center', justifyContent:'center',
      transform:'rotate(15deg)',
      background:'rgba(0,0,0,0.35)',
      backdropFilter:'blur(4px)',
      boxShadow:'0 0 16px rgba(255,180,0,0.25)',
    }}>
      <span style={{
        fontSize:'0.35rem', fontWeight:900, color:'rgba(255,210,80,0.95)',
        textTransform:'uppercase', letterSpacing:'1px', textAlign:'center',
        lineHeight:'1.25', padding:'0 6px',
      }}>
        EDICIÓN<br/>DE<br/>COLECCIONISTA
      </span>
    </div>
  );
}

/* ── Auxiliares internos ─────────────────────────────────────── */
function MetaField({ label, value, span = 1, color = '#ccc', bold = false }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.2rem', gridColumn: span === 2 ? 'span 2' : undefined }}>
      <span style={{ fontSize:'0.5rem', color:'#555', fontWeight:800, letterSpacing:'1px' }}>{label}</span>
      <span style={{ fontSize:'0.75rem', color, fontWeight: bold ? 800 : 600 }}>{value}</span>
    </div>
  );
}

function CloseButton({ onClose }) {
  return (
    <button
      onClick={onClose}
      onMouseOver={e => { e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#fff'; }}
      onMouseOut={e  => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='#aaa'; }}
      style={{
        background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
        color:'#aaa', padding:'0.65rem 2rem', borderRadius:'99px',
        fontSize:'0.65rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'2px',
        cursor:'pointer', transition:'all 0.2s', width:'100%', textAlign:'center',
      }}
    >
      Cerrar boleto
    </button>
  );
}
