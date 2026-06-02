import React from 'react';
import { getEventImageUrl } from '../constants';
import { formatDate, formatTime, getSeatLabel } from '../../../../EventDetail/utils/helpers';

export default function TicketV4({ ticket, onClose }) {
  const code        = ticket.ticket_code || ticket.ticketCode || `TKT-${ticket.id || '000'}`;
  const eventName   = ticket.event?.name  || ticket.eventName  || 'Evento LAIKA';
  const dateRaw     = ticket.event?.date  || ticket.date;
  const timeRaw     = ticket.event?.time  || ticket.time || ticket.event_time || 'N/A';
  const venue       = ticket.event?.venue_name || ticket.venue || 'LAIKA ARENA';
  const imgUrl      = getEventImageUrl(ticket.event?.image_url || ticket.imageUrl);
  
  const sectionName = ticket.section_name || ticket.sectionName || 'GRAL';
  const seatId      = ticket.seat_id || ticket.seatId;
  const seatLabel   = seatId ? getSeatLabel(seatId, ticket.event) : '-';
  
  // Format date for this specific design (e.g. "21 JULY | 18:00")
  let fmtDateShort = 'TBA';
  if (dateRaw) {
    const d = new Date(dateRaw);
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    fmtDateShort = `${day} ${month}`;
  }
  const fmtTime = timeRaw !== 'N/A' ? formatTime(timeRaw) : '00:00';

  // Barcode API
  const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(code)}&scale=3&height=12`;

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        maxWidth: '700px',
        width: '95vw',
        position: 'relative'
      }}
    >
      {/* ── TICKET CONTAINER ── */}
      <div style={{
        display: 'flex',
        height: '260px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        
        {/* ── LEFT PART (MAIN INFO) ── */}
        <div style={{
          flex: 1,
          position: 'relative',
          background: 'linear-gradient(135deg, #0f133f 0%, #172b85 50%, #15114a 100%)',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem',
          color: 'white',
          overflow: 'hidden'
        }}>
          {/* Background event image */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${imgUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.35,
            mixBlendMode: 'luminosity'
          }}></div>
          
          {/* Geometric gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(110deg, rgba(15,19,63,0.95) 0%, rgba(23,43,133,0.7) 40%, rgba(21,17,74,0.85) 100%)',
            pointerEvents: 'none'
          }}></div>

          <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            
            {/* Header info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.3rem' }}>
                <img
                  src="/logob.png"
                  alt="LAIKA Club Logo"
                  style={{
                    height: '14px',
                    width: 'auto',
                    opacity: 0.95,
                    pointerEvents: 'none',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                  }}
                />
                <span style={{ fontSize: '0.65rem', color: '#fde047', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>TOUR</span>
              </div>
              <h2 style={{ 
                margin: '0.2rem 0', fontSize: '2.2rem', fontWeight: 900, textTransform: 'uppercase', 
                letterSpacing: '1px', lineHeight: 1.1,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>
                {eventName}
              </h2>
              <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#38bdf8', letterSpacing: '3px', textTransform: 'uppercase' }}>
                LIVE EVENT
              </h3>
            </div>

            {/* Middle info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
                  {fmtDateShort} <span style={{ color: '#38bdf8', fontWeight: 400, margin: '0 4px' }}>|</span> {fmtTime}
                </h4>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {venue}
                </p>
              </div>
              
              {/* Barcode */}
              <div style={{ background: '#fff', padding: '8px', borderRadius: '4px' }}>
                <img src={barcodeUrl} alt="Barcode" style={{ height: '45px', display: 'block' }} />
              </div>
            </div>

            {/* Bottom info: Entrance, Sector, Row, Seat */}
            <div style={{ 
              display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', 
              paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.15)' 
            }}>
              <BottomStat label="ENTRANCE" value="MAIN" />
              <BottomStat label="SECTOR" value={sectionName} />
              <BottomStat label="ROW" value="-" />
              <BottomStat label="SEAT" value={seatLabel} />
            </div>
          </div>
        </div>

        {/* ── SEPARATOR ── */}
        <div style={{
          width: '2px',
          background: 'linear-gradient(to bottom, #172b85 0%, #e11d48 100%)',
          position: 'relative',
          zIndex: 5
        }}>
          {/* Perforated holes */}
          <div style={{ position: 'absolute', top: '-10px', left: '-9px', width: '20px', height: '20px', borderRadius: '50%', background: '#111' }}></div>
          <div style={{ position: 'absolute', bottom: '-10px', left: '-9px', width: '20px', height: '20px', borderRadius: '50%', background: '#111' }}></div>
          <div style={{
            position: 'absolute', top: '10px', bottom: '10px', left: '-2px', width: '6px',
            backgroundImage: 'radial-gradient(circle, #111 3px, transparent 3px)',
            backgroundSize: '100% 16px',
            backgroundPosition: 'center'
          }}></div>
        </div>

        {/* ── RIGHT PART (STUB) ── */}
        <div style={{
          width: '140px',
          background: 'linear-gradient(135deg, #e11d48 0%, #ec4899 100%)',
          position: 'relative',
          padding: '1.5rem 0.5rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem'
        }}>
          {/* Vertical layout for right side stats */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
            <RightStat label="ENTRANCE" value="MAIN" />
            <RightStat label="SECTOR" value={sectionName} />
            <RightStat label="ROW" value="-" />
            <RightStat label="SEAT" value={seatLabel} />
          </div>

          {/* Vertical layout for right side event info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)'
          }}>
            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'white', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              {eventName}
            </h4>
            <h5 style={{ margin: '0 0.5rem', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              LIVE EVENT
            </h5>
            <p style={{ margin: '0 0.2rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.95)', fontWeight: 700, whiteSpace: 'nowrap' }}>
              {fmtDateShort} | {fmtTime}
            </p>
            <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(255,255,255,0.75)', fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              {venue}
            </p>
          </div>
        </div>

      </div>

      {/* ── CLOSE BUTTON ── */}
      <button
        onClick={onClose}
        style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          color: '#aaa', padding: '0.65rem 2rem', borderRadius: '99px',
          fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px',
          cursor: 'pointer', transition: 'all 0.2s', width: '100%', textAlign: 'center'
        }}
        onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
        onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#aaa'; }}
      >
        Cerrar boleto
      </button>
    </div>
  );
}

function BottomStat({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontSize: '0.55rem', color: '#fde047', fontWeight: 700, letterSpacing: '1px' }}>{label}</span>
      <span style={{ fontSize: '1.1rem', color: 'white', fontWeight: 900, textTransform: 'uppercase' }}>{value}</span>
    </div>
  );
}

function RightStat({ label, value }) {
  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', 
      writingMode: 'vertical-rl', transform: 'rotate(180deg)' 
    }}>
      <span style={{ fontSize: '0.45rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: 900, textTransform: 'uppercase' }}>{value}</span>
    </div>
  );
}
