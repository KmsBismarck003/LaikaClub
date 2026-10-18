import React, { useState, useEffect } from 'react'
import Icon from '../../components/Icons/Icons'
import api from '../../services/api'
import { useNotification } from '../../context/NotificationContext'
import { Link } from 'react-router-dom'

const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=120&q=80',
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=120&q=80',
]

const STATUS = {
  pending:    { label:'PENDIENTE',   color:'#ea580c', bg:'#ea580c20', border:'#ea580c' },
  approved:   { label:'APROBADO',    color:'#16a34a', bg:'#16a34a20', border:'#16a34a' },
  refunded:   { label:'REEMBOLSADO', color:'#10b981', bg:'#10b98120', border:'#10b981' },
  rejected:   { label:'RECHAZADO',   color:'#dc2626', bg:'#dc262620', border:'#dc2626' },
  failed:     { label:'FALLIDO',     color:'#ef4444', bg:'#ef444420', border:'#ef4444' },
  processing: { label:'EN PROCESO',  color:'#2563eb', bg:'#2563eb20', border:'#2563eb' },
}

const REASONS = [
  'Cambio de planes / No podré asistir',
  'Evento cancelado por el organizador',
  'No puedo asistir por enfermedad o fuerza mayor',
  'Cambio de fecha o lugar del evento',
  'Error involuntario en la compra',
  'Otro motivo',
]

export default function RefundTracker() {
  const [requests,  setRequests]  = useState([])
  const [tickets,   setTickets]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ ticketId:'', reason:'', detail:'' })
  const [quote, setQuote] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(false)

  const { success, error: showError } = useNotification()

  const loadData = async () => {
    try {
      const [refs, ticks] = await Promise.all([
        api.refund?.getMyRefunds?.() || Promise.resolve([]),
        api.ticket?.getMyTickets?.() || Promise.resolve([])
      ])
      setRequests(Array.isArray(refs) ? refs : [])
      setTickets(Array.isArray(ticks) ? ticks : [])
    } catch {
      setRequests([])
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // When ticketId changes, fetch live quote
  useEffect(() => {
    let active = true
    if (!form.ticketId) {
      setQuote(null)
      return
    }
    async function fetchQuote() {
      setQuoteLoading(true)
      try {
        const q = await api.refund.getQuote(form.ticketId)
        if (active) setQuote(q)
      } catch (err) {
        if (active) setQuote(null)
      } finally {
        if (active) setQuoteLoading(false)
      }
    }
    fetchQuote()
    return () => { active = false }
  }, [form.ticketId])

  const eligibleTickets = tickets.filter(t => t.status === 'active' || t.status === 'confirmed')

  const pending = requests.filter(r => {
    const s = r.status?.toLowerCase()
    return s === 'pending' || s === 'processing'
  })
  const totalInProcess = pending.reduce((s, r) => s + (parseFloat(r.refundAmount || r.amount || r.price || 0)), 0)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.ticketId) { showError('Selecciona un boleto'); return }
    if (!form.reason) { showError('Selecciona un motivo'); return }
    if (quote && !quote.eligible) {
      showError(quote.rejectionReason || 'Este boleto no es elegible para cancelación')
      return
    }

    setSubmitting(true)
    try {
      const parsedId = Number(form.ticketId)
      await api.refund.requestRefund({
        ticket_id: !isNaN(parsedId) ? parsedId : form.ticketId,
        reason: form.reason,
        detail: form.detail
      })
      success('Solicitud de reembolso registrada exitosamente')
      setForm({ ticketId:'', reason:'', detail:'' })
      setQuote(null)
      setShowForm(false)
      await loadData()
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Error al enviar solicitud de reembolso'
      showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
      {[1,2,3].map(i => <div key={i} style={{ height:'80px', borderRadius:'16px', background:'rgba(255,255,255,.04)' }} />)}
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.75rem' }}>

      {/* ── HEADER + STATS ──────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <span style={{ fontSize:'.65rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'4px', color:'#555', display:'block' }}>
            REEMBOLSOS Y CANCELACIONES
          </span>
          <span style={{ fontSize:'.75rem', color:'#888', fontWeight:600 }}>
            Consulta y gestiona las solicitudes de devolución de tus boletos
          </span>
        </div>

        <div style={{ display:'flex', gap:'.6rem', flexWrap:'wrap' }}>
          {[
            { icon:'clock',      label:'Pendientes', value: pending.length,          color:'#ea580c' },
            { icon:'dollarSign', label:'En proceso',  value:`$${totalInProcess.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, color:'#2563eb' },
          ].map(s => (
            <div key={s.label} style={{
              display:'flex', alignItems:'center', gap:'.65rem',
              background:'#111', border:'1px solid #1e1e1e', borderRadius:'12px', padding:'.55rem 1rem'
            }}>
              <div style={{ width:'30px', height:'30px', borderRadius:'8px', flexShrink:0,
                background:`${s.color}20`, display:'flex', alignItems:'center', justifyContent:'center', color:s.color }}>
                <Icon name={s.icon} size={14} />
              </div>
              <div>
                <div style={{ fontSize:'.9rem', fontWeight:900, color:'#fff', lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:'.52rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'1.5px', color:'#555' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── INFO + ACTION CARDS ─────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>

        {/* Policy card */}
        <div style={{ background:'#0d0d0d', border:'1px solid #1e1e1e', borderLeft:'4px solid #2563eb',
          borderRadius:'16px', padding:'1.25rem 1.5rem', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'.5rem', marginBottom:'1rem' }}>
              <Icon name="info" size={16} style={{ color:'#2563eb' }} />
              <span style={{ fontSize:'.62rem', fontWeight:900, textTransform:'uppercase',
                letterSpacing:'2px', color:'#2563eb' }}>Condiciones de Reembolso</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'.55rem' }}>
              {[
                { icon:'check', text:'Cancelación permitida hasta 24 horas antes del inicio del evento' },
                { icon:'dollarSign', text:'100% de devolución del valor pagado sin penalización por anticipación' },
                { icon:'creditCard', text:'El monto se abona al método original de pago' },
                { icon:'clock', text:'Plazo de procesamiento interbancario de 3 a 5 días hábiles' },
              ].map((item, i) => (
                <div key={i} style={{ display:'flex', gap:'.6rem', alignItems:'flex-start' }}>
                  <Icon name={item.icon} size={12} style={{ color:'#2563eb', flexShrink:0, marginTop:'2px' }} />
                  <span style={{ fontSize:'.68rem', color:'#888', fontWeight:600, lineHeight:1.4 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop:'1rem', paddingTop:'.75rem', borderTop:'1px solid #1a1a1a', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:'.62rem', color:'#555' }}>¿Prefieres gestionar desde tu lista de boletos?</span>
            <Link to="/user/tickets" style={{ fontSize:'.62rem', fontWeight:900, color:'#3b82f6', textDecoration:'none' }}>
              Ir a Mis Boletos
            </Link>
          </div>
        </div>

        {/* Request card */}
        <div style={{ background:'#0d0d0d', border:`1px solid ${showForm ? '#ea580c40' : '#1e1e1e'}`,
          borderRadius:'16px', padding:'1.5rem',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center',
          gap:'1rem', transition:'border-color .2s',
          boxShadow: showForm ? '0 4px 24px #ea580c15' : 'none' }}>

          {!showForm ? (
            <>
              <div style={{ width:'52px', height:'52px', borderRadius:'14px',
                background:'#ea580c20', border:'1px solid #ea580c40',
                display:'flex', alignItems:'center', justifyContent:'center', color:'#ea580c' }}>
                <Icon name="plus" size={26} />
              </div>
              <h3 style={{ margin:0, fontSize:'.9rem', fontWeight:900, color:'#fff', textTransform:'uppercase', letterSpacing:'1px' }}>
                Nueva Solicitud
              </h3>
              <p style={{ margin:0, fontSize:'.7rem', color:'#666', fontWeight:600 }}>
                Selecciona un boleto activo para cotizar y solicitar tu cancelación
              </p>
              <button onClick={() => setShowForm(true)} style={{
                background:'#fff', color:'#000', border:'none',
                padding:'.65rem 1.75rem', borderRadius:'99px',
                fontSize:'.65rem', fontWeight:900, textTransform:'uppercase',
                letterSpacing:'2px', cursor:'pointer', transition:'all .2s'
              }}
                onMouseOver={e => e.currentTarget.style.transform='translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}
              >Solicitar Reembolso</button>
            </>
          ) : (
            <form onSubmit={handleSubmit} style={{ width:'100%', textAlign:'left', display:'flex', flexDirection:'column', gap:'.85rem' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize:'.62rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'2px', color:'#ea580c' }}>
                  Nueva Solicitud de Cancelación
                </span>
                <button type="button" onClick={() => { setShowForm(false); setQuote(null); }} style={{
                  background:'none', border:'none', color:'#555', cursor:'pointer', padding:'4px' }}>
                  <Icon name="close" size={16} />
                </button>
              </div>

              {/* Ticket select */}
              <div>
                <label style={{ fontSize:'.56rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'2px', color:'#666', display:'block', marginBottom:'.35rem' }}>
                  Boleto a Cancelar
                </label>
                <select value={form.ticketId} onChange={e => setForm(p=>({...p,ticketId:e.target.value}))} required
                  style={{ width:'100%', background:'#111', border:'1px solid #2a2a2a', borderRadius:'10px',
                    color:'#fff', padding:'.6rem .9rem', fontSize:'.78rem', outline:'none', boxSizing:'border-box' }}>
                  <option value="">Selecciona un boleto…</option>
                  {eligibleTickets.map((t,i) => (
                    <option key={t.id||i} value={t.id||i}>
                      {t.event?.name || t.eventName || `Boleto #${t.id}`} — {t.ticket_code || t.ticketCode} (${Number(t.price||0).toFixed(2)})
                    </option>
                  ))}
                  {eligibleTickets.length === 0 && (
                    <option value="" disabled>No tienes boletos activos elegibles para cancelar</option>
                  )}
                </select>
              </div>

              {/* Live quote preview */}
              {quoteLoading && (
                <div style={{ fontSize:'.68rem', color:'#3b82f6', display:'flex', alignItems:'center', gap:'.4rem', padding:'.4rem 0' }}>
                  <Icon name="clock" size={12} /> Consultando cotización de reembolso...
                </div>
              )}

              {quote && !quoteLoading && (
                quote.eligible ? (
                  <div style={{
                    background:'rgba(16, 185, 129, 0.08)',
                    border:'1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius:'10px',
                    padding:'.75rem .9rem',
                    display:'flex',
                    flexDirection:'column',
                    gap:'.35rem'
                  }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:'.65rem', fontWeight:900, color:'#10b981', textTransform:'uppercase' }}>
                        Importe a Devolver:
                      </span>
                      <span style={{ fontSize:'.9rem', fontWeight:900, color:'#10b981' }}>
                        ${Number(quote.refundAmount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                      </span>
                    </div>
                    <div style={{ fontSize:'.6rem', color:'#aaa', display:'flex', justifyContent:'space-between' }}>
                      <span>Método: {quote.paymentMethod}</span>
                      <span>Plazo: {quote.estimatedDays}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background:'rgba(239, 68, 68, 0.1)',
                    border:'1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius:'10px',
                    padding:'.65rem .85rem',
                    fontSize:'.68rem',
                    color:'#ef4444',
                    lineHeight:1.3
                  }}>
                    {quote.rejectionReason || 'Este boleto no cumple las condiciones de cancelación.'}
                  </div>
                )
              )}

              {/* Reason select */}
              <div>
                <label style={{ fontSize:'.56rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'2px', color:'#666', display:'block', marginBottom:'.35rem' }}>Motivo</label>
                <select value={form.reason} onChange={e => setForm(p=>({...p,reason:e.target.value}))} required
                  style={{ width:'100%', background:'#111', border:'1px solid #2a2a2a', borderRadius:'10px',
                    color: form.reason ? '#fff' : '#555', padding:'.6rem .9rem', fontSize:'.78rem', outline:'none', boxSizing:'border-box' }}>
                  <option value="">Selecciona un motivo…</option>
                  {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Detail */}
              <div>
                <label style={{ fontSize:'.56rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'2px', color:'#666', display:'block', marginBottom:'.35rem' }}>Detalle adicional (opcional)</label>
                <textarea value={form.detail} onChange={e => setForm(p=>({...p,detail:e.target.value}))}
                  placeholder="Describe brevemente tu situación…" rows={2}
                  style={{ width:'100%', background:'#111', border:'1px solid #2a2a2a', borderRadius:'10px',
                    color:'#fff', padding:'.55rem .85rem', fontSize:'.75rem', outline:'none',
                    resize:'none', fontFamily:'inherit', boxSizing:'border-box' }}/>
              </div>

              <button type="submit" disabled={submitting || (quote && !quote.eligible)} style={{
                background: (submitting || (quote && !quote.eligible)) ? '#333' : '#fff',
                color: (submitting || (quote && !quote.eligible)) ? '#666' : '#000',
                border:'none', padding:'.65rem', borderRadius:'10px',
                fontSize:'.65rem', fontWeight:900, textTransform:'uppercase',
                letterSpacing:'2px', cursor: (submitting || (quote && !quote.eligible)) ? 'not-allowed' : 'pointer' }}>
                {submitting ? 'Enviando…' : 'Enviar Solicitud'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ── MY REQUESTS ─────────────────────────────────────────── */}
      <div>
        <p style={{ margin:'0 0 1rem', fontSize:'.6rem', fontWeight:900, textTransform:'uppercase',
          letterSpacing:'3.5px', color:'#555', paddingBottom:'.75rem', borderBottom:'1px solid #1a1a1a' }}>
          Historial de Solicitudes
        </p>

        {requests.length === 0 ? (
          <div style={{ textAlign:'center', padding:'3rem 2rem',
            background:'#0a0a0a', border:'1px dashed #1a1a1a', borderRadius:'16px' }}>
            <Icon name="inbox" size={40} style={{ opacity:.15, display:'block', margin:'0 auto 1rem', color:'#888' }} />
            <p style={{ margin:0, fontSize:'.78rem', color:'#666' }}>Aún no tienes solicitudes de cancelación registradas</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
            {requests.map((req, idx) => {
              const rawStatus = (req.status || 'pending').toLowerCase()
              const st      = STATUS[rawStatus] || STATUS.pending
              const ticket  = req.ticket
              const name    = req.eventName || ticket?.event?.name || ticket?.eventName || 'Evento'
              const imgUrl  = ticket?.event?.image_url || ticket?.imageUrl || FALLBACK_IMGS[idx % FALLBACK_IMGS.length]
              const amount  = parseFloat(req.refundAmount || req.amount || req.price || ticket?.price || 0)
              const created = req.created_at || req.createdAt
                ? new Date(req.created_at || req.createdAt).toLocaleDateString('es-MX', { day:'numeric', month:'short', year:'numeric' })
                : '—'
              const code = req.ticketCode || req.ticket_code || ticket?.ticket_code || `TKT-${req.ticket_id || req.ticketId || idx}`

              return (
                <div key={req.id || idx} style={{
                  display:'flex', alignItems:'center', gap:'1rem',
                  background:'#111', border:'1px solid #1e1e1e',
                  borderLeft:`3px solid ${st.border}`,
                  borderRadius:'14px', padding:'1rem 1.1rem',
                  transition:'background .15s'
                }}
                  onMouseOver={e => e.currentTarget.style.background='#161616'}
                  onMouseOut={e => e.currentTarget.style.background='#111'}
                >
                  <img src={imgUrl} alt="" style={{ width:'52px', height:'52px',
                    borderRadius:'10px', objectFit:'cover', flexShrink:0, border:'1px solid #222' }} />

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'.5rem', marginBottom:'.2rem' }}>
                      <h4 style={{ margin:0, fontSize:'.88rem', fontWeight:800, color:'#fff',
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</h4>
                      <span style={{ fontSize:'.55rem', fontFamily:'monospace', background:'rgba(255,255,255,.06)', color:'#888', padding:'2px 6px', borderRadius:'4px' }}>
                        {code}
                      </span>
                    </div>

                    <div style={{ display:'flex', gap:'.75rem', flexWrap:'wrap', alignItems:'center' }}>
                      <span style={{ fontSize:'.63rem', color:'#666', fontWeight:600,
                        display:'flex', alignItems:'center', gap:'.3rem' }}>
                        <Icon name="calendar" size={11} /> Solicitado: {created}
                      </span>
                      {req.reason && (
                        <span style={{ fontSize:'.63rem', color:'#555', fontWeight:600,
                          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'240px' }}>
                          {req.reason}
                        </span>
                      )}
                      {req.paymentMethod && (
                        <span style={{ fontSize:'.58rem', color:'#444', fontWeight:600 }}>
                          • {req.paymentMethod}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign:'right', flexShrink:0, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'.4rem' }}>
                    {amount > 0 && (
                      <span style={{ fontSize:'.95rem', fontWeight:900, color:'#fff' }}>
                        ${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                    <span style={{
                      fontSize:'.54rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'1.5px',
                      color:st.color, background:st.bg, border:`1px solid ${st.border}40`,
                      padding:'.22rem .7rem', borderRadius:'99px'
                    }}>{st.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── FOOTER NOTE ─────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', gap:'.5rem',
        padding:'1rem 1.25rem', background:'#0a0a0a',
        border:'1px solid #1a1a1a', borderRadius:'12px' }}>
        <Icon name="info" size={13} style={{ color:'#555', flexShrink:0 }} />
        <p style={{ margin:0, fontSize:'.68rem', color:'#666', fontWeight:600 }}>
          Al aprobarse la cancelación, el boleto queda revocado de inmediato en el sistema de accesos y el importe se dispersa a tu cuenta en 3-5 días hábiles bancarios.
        </p>
      </div>
    </div>
  )
}
