/**
 * TransferModal — Sistema de Transferencia Segura de Boletos
 * Componente presentacional puro; toda la lógica vive en useTicketTransfer.
 *
 * Fases renderizadas:
 *   CONFIRMING → el usuario ingresa el correo del destinatario y su contraseña
 *   GENERATING → spinner mientras se procesa la solicitud
 *   DONE       → confirmación de solicitud enviada o enlace de autoregistro
 */
import React, { useState } from 'react';
import { TRANSFER_PHASE } from '../../hooks/useTicketTransfer';
import { getEventImageUrl } from '../tickets/ticketHelpers';
import './TransferModal.css';

/* Lucide-style SVG icons (sin dependencia externa) */
const Icon = {
  ArrowRight: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Shield: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Mail: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  UserCheck: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7.5" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </svg>
  ),
  Eye: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  X: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Copy: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Check: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Clock: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  AlertCircle: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

function qrUrl(data) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}&qzone=1&color=000000&bgcolor=ffffff`;
}

function formatSeconds(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m`;
}

/* ── Step Indicators ──────────────────────────────────────────── */
function StepIndicator({ phase }) {
  const steps = [
    { id: TRANSFER_PHASE.CONFIRMING, label: 'Destinatario' },
    { id: TRANSFER_PHASE.DONE,       label: 'Resultado' },
  ];

  const phaseOrder = [TRANSFER_PHASE.CONFIRMING, TRANSFER_PHASE.GENERATING, TRANSFER_PHASE.DONE];
  const currentIdx = phaseOrder.indexOf(phase);

  return (
    <div className="trf-steps">
      {steps.map((step, idx) => {
        const stepOrder = phaseOrder.indexOf(step.id === TRANSFER_PHASE.DONE ? TRANSFER_PHASE.DONE : step.id);
        const isDone   = currentIdx > stepOrder;
        const isActive = currentIdx === stepOrder || (step.id === TRANSFER_PHASE.CONFIRMING && currentIdx === 1);

        return (
          <React.Fragment key={step.id}>
            <div className={`trf-steps__item ${isActive ? 'trf-steps__item--active' : ''} ${isDone ? 'trf-steps__item--done' : ''}`}>
              <div className={`trf-steps__dot ${isActive ? 'trf-steps__dot--active' : ''} ${isDone ? 'trf-steps__dot--done' : ''}`}>
                <span style={{ display: isDone ? 'inline-block' : 'none' }}>
                  <Icon.Check size={10} />
                </span>
                <span style={{ display: isDone ? 'none' : 'inline-block' }}>
                  {idx + 1}
                </span>
              </div>
              <span className="trf-steps__label">{step.label}</span>
            </div>
            {idx < steps.length - 1 && <div className="trf-steps__line" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── Ticket Preview Strip ──────────────────────────────────────── */
function TicketStrip({ ticket }) {
  const name    = ticket?.event?.name || ticket?.eventName || 'Evento LAIKA';
  const section = ticket?.section_name || ticket?.sectionName || 'General';
  const imgUrl  = getEventImageUrl(ticket?.event?.image_url || ticket?.imageUrl);

  return (
    <div className="trf-ticket-strip">
      <img src={imgUrl} alt={name} className="trf-ticket-strip__img" />
      <div className="trf-ticket-strip__info">
        <p className="trf-ticket-strip__name">{name}</p>
        <p className="trf-ticket-strip__meta">{section}</p>
      </div>
      <span className="trf-ticket-strip__badge">Activo</span>
    </div>
  );
}

/* ── Phase: Confirming ─────────────────────────────────────────── */
function PhaseConfirming({
  ticket,
  recipientEmail,
  setRecipientEmail,
  password,
  setPassword,
  onConfirm,
  onCancel,
  errorMsg,
  loading
}) {
  const [showPwd, setShowPwd] = useState(false);

  return (
    <>
      <div className="trf-body">
        <StepIndicator phase={TRANSFER_PHASE.CONFIRMING} />

        <TicketStrip ticket={ticket} />

        <div className="trf-security-note">
          <span className="trf-security-note__icon"><Icon.Shield size={15} /></span>
          <p className="trf-security-note__text">
            Indica el correo registrado del destinatario. Si la persona aún no tiene cuenta en LAIKA Club, se generará una invitación para que se registre y reclame el boleto.
          </p>
        </div>

        {/* Campo de Correo Electrónico */}
        <div className="trf-field">
          <label className="trf-field__label">Correo electrónico del destinatario</label>
          <div className="trf-field__input-wrap">
            <input
              id="trf-email-input"
              className="trf-field__input"
              type="email"
              value={recipientEmail}
              onChange={e => setRecipientEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              autoFocus={true}
              autoComplete="email"
            />
          </div>
        </div>

        {/* Campo de Contraseña de Confirmación */}
        <div className="trf-field">
          <label className="trf-field__label">Contraseña de tu cuenta (confirmación)</label>
          <div className="trf-field__input-wrap">
            <input
              id="trf-password-input"
              className="trf-field__input"
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onConfirm()}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="trf-field__toggle"
              onClick={() => setShowPwd(v => !v)}
              tabIndex={-1}
              aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              <span style={{ display: showPwd ? 'inline-block' : 'none' }}>
                <Icon.EyeOff size={16} />
              </span>
              <span style={{ display: showPwd ? 'none' : 'inline-block' }}>
                <Icon.Eye size={16} />
              </span>
            </button>
          </div>
        </div>

        <div className="trf-error" style={{ display: errorMsg ? 'flex' : 'none' }}>
          <Icon.AlertCircle size={14} />
          <span>{errorMsg || ''}</span>
        </div>
      </div>

      <div className="trf-footer">
        <button
          id="trf-confirm-btn"
          className="trf-btn trf-btn--primary"
          onClick={onConfirm}
          disabled={loading || !recipientEmail.trim()}
        >
          <span className="trf-btn__icon">
            <span className="trf-spinner" style={{ display: loading ? 'inline-block' : 'none' }} />
            <span style={{ display: loading ? 'none' : 'inline-block' }}>
              <Icon.ArrowRight size={15} />
            </span>
          </span>
          <span className="trf-btn__text">
            <span style={{ display: loading ? 'inline' : 'none' }}>Procesando...</span>
            <span style={{ display: loading ? 'none' : 'inline' }}>Confirmar y Transferir</span>
          </span>
        </button>
        <button className="trf-btn trf-btn--ghost" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </>
  );
}

/* ── Phase: Done (Registered or Invitation link) ──────────────── */
function PhaseDone({ transferData, claimUrl, secondsLeft, onClose }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      if (claimUrl) {
        await navigator.clipboard.writeText(claimUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      /* Fallback manual */
    }
  };

  const isRegistered = transferData?.is_registered_user;

  return (
    <>
      <div className="trf-body">
        <StepIndicator phase={TRANSFER_PHASE.DONE} />

        {isRegistered ? (
          /* Destinatario registrado */
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#22c55e', margin: '0 auto 1.25rem'
            }}>
              <Icon.UserCheck size={28} />
            </div>

            <h3 style={{ margin: '0 0 .5rem', fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>
              Solicitud de Transferencia Enviada
            </h3>
            <p style={{ margin: '0 0 1.25rem', fontSize: '.8rem', color: '#aaa', lineHeight: 1.5 }}>
              Hemos notificado a <strong style={{ color: '#fff' }}>{transferData?.recipient_email}</strong>.
              El boleto permanecerá congelado y pasará a su cuenta cuando acepte la solicitud.
            </p>

            <div className="trf-security-note">
              <span className="trf-security-note__icon"><Icon.Shield size={15} /></span>
              <p className="trf-security-note__text">
                Tu código QR original está bloqueado. Si el destinatario rechaza la solicitud o si decides cancelarla antes de que sea aceptada, el boleto regresará a tu Wallet.
              </p>
            </div>
          </div>
        ) : (
          /* Destinatario NO registrado */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'rgba(59, 130, 246, 0.15)', border: '1px solid #3b82f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#3b82f6', margin: '0 auto .75rem'
              }}>
                <Icon.Mail size={26} />
              </div>

              <h3 style={{ margin: '0 0 .35rem', fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>
                Invitación de Transferencia Creada
              </h3>
              <p style={{ margin: 0, fontSize: '.78rem', color: '#888', lineHeight: 1.5 }}>
                El usuario <strong style={{ color: '#fff' }}>{transferData?.recipient_email}</strong> aún no tiene cuenta. Comparte este enlace protegido para que se registre y reclame el boleto:
              </p>
            </div>

            {/* QR de registro */}
            {claimUrl && (
              <div className="trf-qr-section" style={{ padding: '.5rem 0' }}>
                <div className="trf-qr-frame">
                  <img src={qrUrl(claimUrl)} alt="QR de invitación" />
                </div>
              </div>
            )}

            <div className="trf-link-box">
              <span className="trf-link-box__url">{claimUrl}</span>
              <button
                id="trf-copy-btn"
                className={`trf-link-box__copy ${copied ? 'trf-link-box__copy--copied' : ''}`}
                onClick={copyLink}
              >
                <span style={{ display: copied ? 'inline' : 'none' }}>Copiado</span>
                <span style={{ display: copied ? 'none' : 'inline' }}>Copiar Enlace</span>
              </button>
            </div>

            <div className="trf-security-note" style={{ marginTop: '1rem' }}>
              <span className="trf-security-note__icon"><Icon.Shield size={15} /></span>
              <p className="trf-security-note__text">
                Al registrarse con este enlace, se le acreditará automáticamente su propio código QR y tu credencial original quedará permanentemente revocada.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="trf-footer">
        <button className="trf-btn trf-btn--ghost" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </>
  );
}

/* ── Main TransferModal ────────────────────────────────────────── */
export default function TransferModal({
  phase,
  ticket,
  recipientEmail,
  setRecipientEmail,
  password,
  setPassword,
  transferData,
  claimUrl,
  secondsLeft,
  errorMsg,
  loading,
  onConfirm,
  onCancel,
}) {
  if (phase === TRANSFER_PHASE.IDLE) return null;

  return (
    <div className="trf-overlay" onClick={onCancel}>
      <div className="trf-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="trf-header">
          <div className="trf-header__left">
            <div className="trf-header__icon">
              <Icon.Shield size={18} />
            </div>
            <div>
              <p className="trf-header__title">Transferencia Segura</p>
              <p className="trf-header__subtitle">Traspaso de boleto — LAIKA Club</p>
            </div>
          </div>
          <button className="trf-header__close" onClick={onCancel} aria-label="Cerrar">
            <Icon.X size={14} />
          </button>
        </div>

        {/* Phase Confirming / Generating */}
        <div style={{ display: (phase === TRANSFER_PHASE.CONFIRMING || phase === TRANSFER_PHASE.GENERATING) ? 'block' : 'none' }}>
          <PhaseConfirming
            ticket={ticket}
            recipientEmail={recipientEmail}
            setRecipientEmail={setRecipientEmail}
            password={password}
            setPassword={setPassword}
            onConfirm={onConfirm}
            onCancel={onCancel}
            errorMsg={errorMsg}
            loading={loading || phase === TRANSFER_PHASE.GENERATING}
          />
        </div>

        {/* Phase Done */}
        <div style={{ display: (phase === TRANSFER_PHASE.DONE) ? 'block' : 'none' }}>
          <PhaseDone
            transferData={transferData}
            claimUrl={claimUrl || ''}
            secondsLeft={secondsLeft}
            onClose={onCancel}
          />
        </div>
      </div>
    </div>
  );
}
