/**
 * TICKET TEMPLATE — V1
 * Versión clásica: fondo oscuro, QR grande centrado, grid de metadatos.
 * Props: { ticket, onClose }
 * Para crear una nueva versión: copia esta carpeta (bol_v1 → bol_v2),
 * edita el JSX y regístrala en TicketModal.jsx.
 */
import React from 'react';
import { qr } from '../constants';
import { formatDate, formatTime, getSeatLabel } from '../../../../EventDetail/utils/helpers';

export default function TicketV1({ ticket, onClose }) {
  const code        = ticket.ticket_code || ticket.ticketCode || `TKT-${ticket.id || '000'}`;
  const name        = ticket.event?.name  || ticket.eventName  || 'Evento';
  const dateRaw     = ticket.event?.date  || ticket.date;
  const timeRaw     = ticket.event?.time  || ticket.time || ticket.event_time || 'N/A';
  const venue       = ticket.event?.venue_name || ticket.venue || 'LAIKA ARENA';
  const seatId      = ticket.seat_id || ticket.seatId;
  const sectionName = ticket.section_name || ticket.sectionName || 'General';
  const seatLabel   = seatId ? getSeatLabel(seatId, ticket.event) : null;
  const fmtDate     = dateRaw   ? formatDate(dateRaw)  : 'POR CONFIRMAR';
  const fmtTime     = timeRaw !== 'N/A' ? formatTime(timeRaw) : '';

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        background:    'linear-gradient(160deg, #0c0b11 0%, #15141e 100%)',
        border:        '1px solid rgba(255,255,255,0.12)',
        borderRadius:  '28px',
        padding:       '2rem',
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:           '1.5rem',
        maxWidth:      '450px',
        width:         '90vw',
        boxShadow:     '0 25px 60px -15px rgba(0,0,0,0.9), 0 0 40px rgba(121,40,202,0.15)',
        position:      'relative',
        overflow:      'hidden',
      }}
    >
      {/* Glow decorativo */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: '120%', height: '40%', pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(circle, rgba(121,40,202,0.18) 0%, transparent 70%)',
      }}/>

      {/* Cabecera */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.25rem', zIndex:1, textAlign:'center' }}>
        <img
          src="/logob.png"
          alt="LAIKA Club Logo"
          style={{
            height: '20px',
            width: 'auto',
            marginBottom: '0.4rem',
            pointerEvents: 'none',
          }}
        />
        <span style={{
          fontSize:'0.62rem', fontWeight:900, textTransform:'uppercase',
          letterSpacing:'5px', color:'#A855F7',
          textShadow:'0 0 10px rgba(168,85,247,0.3)',
        }}>BOLETO DIGITAL</span>
        <h2 style={{
          margin:'0.5rem 0 0', fontSize:'1.5rem', fontWeight:900,
          color:'#fff', lineHeight:1.2, textTransform:'uppercase', letterSpacing:'0.5px',
        }}>{name}</h2>
      </div>

      {/* Línea de perforación */}
      <div style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
        margin:'0.5rem 0', position:'relative', zIndex:1 }}>
        <div style={{ width:'16px', height:'16px', borderRadius:'50%', background:'#000', marginLeft:'-2.5rem', borderRight:'1px solid rgba(255,255,255,0.12)' }}/>
        <div style={{ flex:1, borderTop:'2px dashed rgba(255,255,255,0.1)', margin:'0 0.5rem' }}/>
        <div style={{ width:'16px', height:'16px', borderRadius:'50%', background:'#000', marginRight:'-2.5rem', borderLeft:'1px solid rgba(255,255,255,0.12)' }}/>
      </div>

      {/* QR grande */}
      <div style={{
        position:'relative', zIndex:1, padding:'0.75rem',
        borderRadius:'24px', background:'rgba(255,255,255,0.02)',
        border:'1px solid rgba(255,255,255,0.08)',
        boxShadow:'inset 0 0 20px rgba(255,255,255,0.02)',
      }}>
        <div style={{
          width:'210px', height:'210px', borderRadius:'16px', overflow:'hidden',
          background:'#fff', padding:'0.5rem', boxShadow:'0 10px 25px rgba(0,0,0,0.5)',
        }}>
          <img src={qr(code)} alt="QR" style={{ width:'100%', height:'100%', display:'block' }}/>
        </div>
      </div>

      {/* Código */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.1rem', zIndex:1 }}>
        <span style={{ fontSize:'0.5rem', color:'#666', letterSpacing:'2px', fontWeight:800 }}>CÓDIGO DE ACCESO</span>
        <span style={{ fontFamily:'monospace', fontSize:'1rem', color:'#E9D5FF', letterSpacing:'3px', fontWeight:700 }}>{code}</span>
      </div>

      {/* Grid de metadatos */}
      <div style={{
        width:'100%', background:'rgba(255,255,255,0.03)',
        border:'1px solid rgba(255,255,255,0.06)', borderRadius:'20px',
        padding:'1.25rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', zIndex:1,
      }}>
        <MetaField label="FECHA"  value={fmtDate} />
        <MetaField label="HORARIO" value={fmtTime ? `${fmtTime} HRS` : '—'} />
        <MetaField label="LUGAR"  value={venue} span={2} />
        <MetaField label="ZONA"   value={sectionName} color="#A855F7" bold />
        <MetaField label="ASIENTO" value={seatLabel ? `ASIENTO ${seatLabel}` : 'GENERAL'}
          color={seatLabel ? '#22C55E' : '#888'} bold />
      </div>

      {/* Botón cerrar */}
      <CloseButton onClose={onClose} />
    </div>
  );
}

/* ── Auxiliares internos ─────────────────────────────────────── */
function MetaField({ label, value, span = 1, color = '#fff', bold = false }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.2rem', gridColumn: span === 2 ? 'span 2' : undefined }}>
      <span style={{ fontSize:'0.55rem', color:'#555', fontWeight:800, letterSpacing:'1px' }}>{label}</span>
      <span style={{ fontSize:'0.8rem', color, fontWeight: bold ? 800 : 700 }}>{value}</span>
    </div>
  );
}

function CloseButton({ onClose }) {
  return (
    <button
      onClick={onClose}
      onMouseOver={e => { e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#fff'; }}
      onMouseOut={e  => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='#ccc'; }}
      style={{
        background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
        color:'#ccc', padding:'0.65rem 2rem', borderRadius:'99px',
        fontSize:'0.65rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'2px',
        cursor:'pointer', transition:'all 0.2s', zIndex:1, width:'100%', textAlign:'center',
      }}
    >
      Cerrar boleto
    </button>
  );
}
