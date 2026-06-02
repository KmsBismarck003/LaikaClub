/**
 * TransferModal — Sistema de Transferencia Segura de Boletos
 * Componente presentacional puro; toda la lógica vive en useTicketTransfer.
 *
 * Fases renderizadas:
 *   CONFIRMING → el usuario ingresa su contraseña
 *   GENERATING → spinner mientras se crea el token
 *   DONE       → muestra QR + link copiable con countdown
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
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

/* ── Step Indicators ──────────────────────────────────────────── */
function StepIndicator({ phase }) {
  const steps = [
    { id: TRANSFER_PHASE.CONFIRMING, label: 'Verificar' },
    { id: TRANSFER_PHASE.DONE,       label: 'Compartir' },
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
  const name    = ticket?.event?.name || ticket?.eventName || 'Evento';
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
function PhaseConfirming({ ticket, password, setPassword, onConfirm, onCancel, errorMsg, loading }) {
  const [showPwd, setShowPwd] = useState(false);

  return (
    <>
      <div className="trf-body">
        <StepIndicator phase={TRANSFER_PHASE.CONFIRMING} />

        <TicketStrip ticket={ticket} />

        <div className="trf-security-note">
          <span className="trf-security-note__icon"><Icon.Shield size={15} /></span>
          <p className="trf-security-note__text">
            Por tu seguridad, confirma tu <strong>contrasena de cuenta</strong>.
            Esta accion generara un enlace de transferencia que expira en
            <strong> 10 minutos</strong>.
          </p>
        </div>

        <div className="trf-field">
          <label className="trf-field__label">Contrasena de cuenta</label>
          <div className="trf-field__input-wrap">
            <input
              id="trf-password-input"
              className="trf-field__input"
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onConfirm()}
              placeholder="Ingresa tu contrasena"
              autoFocus={true}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="trf-field__toggle"
              onClick={() => setShowPwd(v => !v)}
              tabIndex={-1}
              aria-label={showPwd ? 'Ocultar contrasena' : 'Mostrar contrasena'}
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
          disabled={loading || !password.trim()}
        >
          <span className="trf-btn__icon">
            <span className="trf-spinner" style={{ display: loading ? 'inline-block' : 'none' }} />
            <span style={{ display: loading ? 'none' : 'inline-block' }}>
              <Icon.ArrowRight size={15} />
            </span>
          </span>
          <span className="trf-btn__text">
            <span style={{ display: loading ? 'inline' : 'none' }}>Verificando...</span>
            <span style={{ display: loading ? 'none' : 'inline' }}>Confirmar y generar enlace</span>
          </span>
        </button>
        <button className="trf-btn trf-btn--ghost" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </>
  );
}

/* ── Phase: Done (QR + link) ───────────────────────────────────── */
function PhaseDone({ claimUrl, tokenData, secondsLeft, onClose }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(claimUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* fallback: select text manually */
    }
  };

  const isUrgent = secondsLeft > 0 && secondsLeft <= 120;
  const expired  = secondsLeft === 0;

  return (
    <>
      <div className="trf-body">
        <StepIndicator phase={TRANSFER_PHASE.DONE} />

        <div className="trf-qr-section">
          <div className="trf-qr-frame">
            <img 
              src={claimUrl ? qrUrl(claimUrl) : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'} 
              alt="QR de transferencia" 
              style={{ display: claimUrl ? 'block' : 'none' }}
            />
          </div>

          <div className={`trf-countdown ${isUrgent ? 'trf-countdown--urgent' : 'trf-countdown--normal'}`}>
            <Icon.Clock size={13} />
            <span>
              <span style={{ display: expired ? 'inline' : 'none' }}>Enlace expirado</span>
              <span style={{ display: expired ? 'none' : 'inline' }}>
                Expira en {formatSeconds(secondsLeft)}
              </span>
            </span>
          </div>
        </div>

        <div className="trf-security-note">
          <span className="trf-security-note__icon"><Icon.Shield size={15} /></span>
          <p className="trf-security-note__text">
            Muestra este QR o comparte el enlace con la persona que recibira el boleto.
            Al reclamarlo, <strong>tu codigo QR original sera invalidado</strong> de forma permanente.
          </p>
        </div>

        <div className="trf-link-box">
          <span className="trf-link-box__url">{claimUrl}</span>
          <button
            id="trf-copy-btn"
            className={`trf-link-box__copy ${copied ? 'trf-link-box__copy--copied' : ''}`}
            onClick={copyLink}
          >
            <span style={{ display: copied ? 'inline' : 'none' }}>Copiado</span>
            <span style={{ display: copied ? 'none' : 'inline' }}>Copiar</span>
          </button>
        </div>
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
  password,
  setPassword,
  tokenData,
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
            claimUrl={claimUrl || ''}
            tokenData={tokenData}
            secondsLeft={secondsLeft}
            onClose={onCancel}
          />
        </div>
      </div>
    </div>
  );
}
