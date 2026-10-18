import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/Icons/Icons';
import api from '../../../../services/api';
import { useNotification } from '../../../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const REASON_OPTIONS = [
  'Cambio de planes / No podré asistir',
  'Motivos de salud o fuerza mayor',
  'Error involuntario en la compra',
  'Cambio de fecha o logística personal',
  'Otro motivo'
];

export default function CancelTicketModal({ ticket, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quote, setQuote] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedReason, setSelectedReason] = useState(REASON_OPTIONS[0]);
  const [extraDetail, setExtraDetail] = useState('');
  const [completedResult, setCompletedResult] = useState(null);

  const { success, error: notifyError } = useNotification();
  const navigate = useNavigate();

  const ticketId = ticket?.id || ticket?.ticket_id;

  useEffect(() => {
    let isMounted = true;
    async function loadQuote() {
      if (!ticketId) {
        setErrorMsg('Identificador de boleto no válido.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setErrorMsg(null);
        const data = await api.refund.getQuote(ticketId);
        if (isMounted) {
          setQuote(data);
        }
      } catch (err) {
        if (isMounted) {
          const msg = err?.response?.data?.message || err?.message || 'Error al consultar las condiciones de cancelación.';
          setErrorMsg(msg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadQuote();
    return () => { isMounted = false; };
  }, [ticketId]);

  const handleConfirmCancellation = async () => {
    if (!ticketId) return;
    setSubmitting(true);
    try {
      const payload = {
        ticket_id: ticketId,
        reason: selectedReason,
        detail: extraDetail.trim() ? extraDetail.trim() : undefined
      };
      const response = await api.refund.requestRefund(payload);
      setCompletedResult(response || { success: true });
      success('Boleto cancelado y reembolso procesado exitosamente.');
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Error al procesar la cancelación del boleto.';
      notifyError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoToRefunds = () => {
    if (onClose) onClose();
    navigate('/user/refunds');
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '540px',
          background: '#0d0d12',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        {/* ── HEADER ──────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444'
              }}
            >
              <Icon name="trash2" size={16} />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '.95rem',
                  fontWeight: 900,
                  color: '#fff',
                  textTransform: 'uppercase',
                  letterSpacing: '.5px'
                }}
              >
                Solicitar Cancelación
              </h2>
              <span style={{ fontSize: '.62rem', color: '#666', fontWeight: 600 }}>
                {ticket?.ticket_code || ticket?.ticketCode || 'Boleto'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={submitting}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* ── BODY CONTENT ────────────────────────────────────────── */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Loading state */}
          {loading && (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  border: '3px solid rgba(255,255,255,.1)',
                  borderTopColor: '#2563eb',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }}
              />
              <p style={{ margin: 0, fontSize: '.75rem', color: '#888', fontWeight: 600 }}>
                Verificando condiciones de cancelación y reembolso con el evento...
              </p>
            </div>
          )}

          {/* Error loading quote */}
          {!loading && errorMsg && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                display: 'flex',
                gap: '.75rem',
                alignItems: 'flex-start'
              }}
            >
              <Icon name="info" size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ margin: '0 0 .25rem', fontSize: '.78rem', fontWeight: 800, color: '#ef4444' }}>
                  No se pudo verificar la elegibilidad
                </h4>
                <p style={{ margin: 0, fontSize: '.7rem', color: '#ccc', lineHeight: 1.4 }}>
                  {errorMsg}
                </p>
              </div>
            </div>
          )}

          {/* Success Result View */}
          {!loading && completedResult && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.25rem', padding: '1rem 0' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '2px solid #10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981'
                }}
              >
                <Icon name="check" size={28} />
              </div>

              <div>
                <h3 style={{ margin: '0 0 .35rem', fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>
                  ¡Cancelación Aprobada!
                </h3>
                <p style={{ margin: 0, fontSize: '.75rem', color: '#888', maxWidth: '380px', lineHeight: 1.5 }}>
                  El boleto ha sido revocado y el asiento liberado. El reembolso por{' '}
                  <strong style={{ color: '#10b981' }}>
                    ${Number(completedResult.refundAmount || quote?.refundAmount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </strong>{' '}
                  ha sido registrado y se dispersará al método de pago original.
                </p>
              </div>

              <div
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '.85rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '.72rem'
                }}
              >
                <span style={{ color: '#666', fontWeight: 700 }}>FOLIO DE SOLICITUD</span>
                <span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 900 }}>
                  {completedResult.gatewayRefundId || `REF-${completedResult.id || Date.now()}`}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '.75rem', width: '100%' }}>
                <button
                  type="button"
                  onClick={handleGoToRefunds}
                  style={{
                    flex: 1,
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '.75rem 1rem',
                    fontSize: '.7rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    cursor: 'pointer'
                  }}
                >
                  Ver en Mis Reembolsos
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '.75rem 1.25rem',
                    fontSize: '.7rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {/* Not eligible */}
          {!loading && !completedResult && quote && !quote.eligible && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '.6rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: '#ef4444' }}>
                  <Icon name="info" size={18} />
                  <span style={{ fontSize: '.78rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Cancelación No Permitida
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '.75rem', color: '#ddd', lineHeight: 1.5 }}>
                  {quote.rejectionReason || 'Este boleto no cumple con las condiciones vigentes de cancelación y reembolso.'}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '.65rem 1.5rem',
                    fontSize: '.7rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Entendido / Volver
                </button>
              </div>
            </div>
          )}

          {/* Eligible quote details and form */}
          {!loading && !completedResult && quote && quote.eligible && (
            <>
              {/* Event & Seat preview */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 .2rem', fontSize: '.85rem', fontWeight: 900, color: '#fff' }}>
                    {quote.eventName || ticket?.event?.name || 'Evento'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '.68rem', color: '#777' }}>
                    {quote.eventDate || 'Fecha'} | {quote.seatInfo || 'Entrada General'}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: '.58rem',
                    fontWeight: 900,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    color: '#10b981',
                    background: 'rgba(16, 185, 129, 0.15)',
                    padding: '.3rem .75rem',
                    borderRadius: '99px',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  Elegible (100%)
                </span>
              </div>

              {/* Financial Breakdown (Criterio 3) */}
              <div
                style={{
                  background: '#111116',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '.85rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', color: '#888' }}>
                  <span>Precio de compra original</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>
                    ${Number(quote.originalPrice || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', color: '#888' }}>
                  <span>Penalización por cancelación anticipada</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>$0.00 MXN (Sin penalización)</span>
                </div>

                <div
                  style={{
                    height: '1px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    margin: '.25rem 0'
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '.78rem', fontWeight: 900, color: '#fff', display: 'block' }}>
                      Importe Neto Reembolsable
                    </span>
                    <span style={{ fontSize: '.62rem', color: '#666' }}>
                      Método: {quote.paymentMethod || 'Método de pago original'}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 900,
                      color: '#10b981'
                    }}
                  >
                    ${Number(quote.refundAmount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Processing details */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '10px',
                    padding: '.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.6rem'
                  }}
                >
                  <Icon name="clock" size={14} style={{ color: '#3b82f6' }} />
                  <div>
                    <div style={{ fontSize: '.58rem', fontWeight: 800, color: '#666', textTransform: 'uppercase' }}>Plazo Estimado</div>
                    <div style={{ fontSize: '.7rem', fontWeight: 800, color: '#ddd' }}>{quote.estimatedDays || '3-5 días hábiles'}</div>
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '10px',
                    padding: '.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.6rem'
                  }}
                >
                  <Icon name="creditCard" size={14} style={{ color: '#10b981' }} />
                  <div>
                    <div style={{ fontSize: '.58rem', fontWeight: 800, color: '#666', textTransform: 'uppercase' }}>Destino</div>
                    <div style={{ fontSize: '.7rem', fontWeight: 800, color: '#ddd' }}>Misma cuenta / tarjeta</div>
                  </div>
                </div>
              </div>

              {/* Motivo selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                <label style={{ fontSize: '.62rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: '#666' }}>
                  Motivo de cancelación
                </label>
                <select
                  value={selectedReason}
                  onChange={e => setSelectedReason(e.target.value)}
                  style={{
                    background: '#121216',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: '#fff',
                    padding: '.65rem .85rem',
                    fontSize: '.78rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {REASON_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Extra notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                <label style={{ fontSize: '.62rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: '#666' }}>
                  Comentarios adicionales (opcional)
                </label>
                <textarea
                  value={extraDetail}
                  onChange={e => setExtraDetail(e.target.value)}
                  placeholder="Escribe algún detalle relevante si lo deseas..."
                  rows={2}
                  style={{
                    background: '#121216',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: '#fff',
                    padding: '.65rem .85rem',
                    fontSize: '.75rem',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Rule & Access Revocation Warning (Criterios 4 y 7) */}
              <div
                style={{
                  background: 'rgba(234, 88, 12, 0.08)',
                  border: '1px solid rgba(234, 88, 12, 0.25)',
                  borderRadius: '12px',
                  padding: '.85rem 1rem',
                  display: 'flex',
                  gap: '.65rem',
                  alignItems: 'flex-start'
                }}
              >
                <Icon name="info" size={16} style={{ color: '#ea580c', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '.68rem', color: '#ffedd5', lineHeight: 1.4 }}>
                  <strong>Aviso de revocación:</strong> Al confirmar, este boleto dejará de ser válido inmediatamente para ingresar al evento, su código QR quedará anulado y el asiento se liberará automáticamente.
                </p>
              </div>

              {/* Confirmation Buttons */}
              <div style={{ display: 'flex', gap: '.75rem', marginTop: '.5rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#aaa',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '.75rem 1rem',
                    fontSize: '.72rem',
                    fontWeight: 800,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  Conservar Boleto
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancellation}
                  disabled={submitting}
                  style={{
                    flex: 1.4,
                    background: submitting ? '#7f1d1d' : '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '.75rem 1rem',
                    fontSize: '.72rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '.5px',
                    cursor: submitting ? 'wait' : 'pointer',
                    boxShadow: '0 4px 16px rgba(220, 38, 38, 0.35)',
                    transition: 'all .2s ease'
                  }}
                >
                  {submitting ? 'Cancelando...' : 'Confirmar Cancelación'}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
