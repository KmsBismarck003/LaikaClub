/**
 * ClaimTicketPage — Pantalla de Reclamación de Boleto Transferido
 * Ruta: /ticket/claim/:token
 *
 * Esta página es de acceso público (para que el receptor la vea).
 * Requiere auth solo al aceptar (redirige a login si no está autenticado).
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { transferAPI } from '../../services/transfer.service';
import './ClaimTicketPage.css';

/* SVG icons inline */
const CheckCircle = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const XCircle = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const UserIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const CalendarIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const MapPinIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const ClockIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const ShieldIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

/* ── Format helpers ───────────────────────────────────────────── */
function formatSeconds(s) {
  const m   = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function formatDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('es-MX', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  } catch {
    return iso;
  }
}

/* ── Page States ─────────────────────────────────────────────── */
const STATE = {
  LOADING:  'loading',
  READY:    'ready',
  CLAIMING: 'claiming',
  SUCCESS:  'success',
  ERROR:    'error',
};

export default function ClaimTicketPage() {
  const { token }    = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuth();
  const { success: notify, error: notifyError } = useNotification();

  const [state,       setState]       = useState(STATE.LOADING);
  const [ticketInfo,  setTicketInfo]  = useState(null);
  const [errorMsg,    setErrorMsg]    = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);

  /* ── Load ticket info ─── */
  useEffect(() => {
    if (!token) {
      setState(STATE.ERROR);
      setErrorMsg('Enlace de transferencia inválido.');
      return;
    }

    transferAPI.getInfo(token)
      .then(data => {
        setTicketInfo(data);
        setSecondsLeft(data.seconds_left || 0);
        setState(data.seconds_left > 0 ? STATE.READY : STATE.ERROR);
        if (data.seconds_left <= 0) {
          setErrorMsg('Este enlace de transferencia ha expirado.');
        }
      })
      .catch(err => {
        const msg = err?.message || err?.data?.detail || 'Enlace no válido o expirado.';
        setErrorMsg(msg);
        setState(STATE.ERROR);
      });
  }, [token]);

  /* ── Countdown ─── */
  useEffect(() => {
    if (state !== STATE.READY || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setState(STATE.ERROR);
          setErrorMsg('El enlace de transferencia ha expirado.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state, secondsLeft]);

  /* ── Claim handler ─── */
  const handleClaim = useCallback(async () => {
    if (!user) {
      // Guardar el token en sessionStorage y redirigir al login
      sessionStorage.setItem('pending_claim_token', token);
      navigate(`/login?redirect=/ticket/claim/${token}`);
      return;
    }

    setState(STATE.CLAIMING);
    try {
      await transferAPI.claim(token);
      notify('Boleto reclamado exitosamente. Ya esta en tu Wallet.');
      setState(STATE.SUCCESS);
    } catch (err) {
      const msg = err?.message || err?.data?.detail || 'Error al reclamar el boleto.';
      notifyError(msg);
      setErrorMsg(msg);
      setState(STATE.ERROR);
    }
  }, [token, user, navigate, notify, notifyError]);

  /* ── Render: Loading ─── */
  if (state === STATE.LOADING) {
    return (
      <div className="claim-page">
        <div className="claim-card">
          <div className="claim-card__brand">
            <img src="/logob.png" alt="LAIKA Club" className="claim-card__logo" />
          </div>
          <div className="claim-loading">
            <div className="claim-loading__spinner" />
            <p className="claim-loading__text">Verificando enlace de transferencia...</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Render: Success ─── */
  if (state === STATE.SUCCESS) {
    return (
      <div className="claim-page">
        <div className="claim-card">
          <div className="claim-card__brand">
            <img src="/logob.png" alt="LAIKA Club" className="claim-card__logo" />
          </div>
          <div className="claim-state">
            <div className="claim-state__icon claim-state__icon--success">
              <CheckCircle size={36} />
            </div>
            <h1 className="claim-state__title">Boleto Reclamado</h1>
            <p className="claim-state__body">
              El boleto ha sido transferido exitosamente a tu cuenta.
              El codigo QR anterior fue invalidado y uno nuevo fue generado en tu Wallet.
            </p>
          </div>
          <div className="claim-actions">
            <button
              className="claim-btn claim-btn--accept"
              onClick={() => navigate('/user/tickets')}
            >
              Ver mi Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Render: Error / Expired ─── */
  if (state === STATE.ERROR) {
    return (
      <div className="claim-page">
        <div className="claim-card">
          <div className="claim-card__brand">
            <img src="/logob.png" alt="LAIKA Club" className="claim-card__logo" />
          </div>
          <div className="claim-state">
            <div className="claim-state__icon claim-state__icon--error">
              <XCircle size={36} />
            </div>
            <h1 className="claim-state__title">Enlace No Disponible</h1>
            <p className="claim-state__body">{errorMsg}</p>
          </div>
          <div className="claim-actions">
            <button className="claim-btn claim-btn--secondary" onClick={() => navigate('/')}>
              Ir al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Render: Ready ─── */
  const isUrgent = secondsLeft > 0 && secondsLeft <= 120;

  return (
    <div className="claim-page">
      <div className="claim-card">
        {/* Brand */}
        <div className="claim-card__brand">
          <img src="/logob.png" alt="LAIKA Club" className="claim-card__logo" />
          <span className="claim-card__brand-text">Transferencia Segura</span>
        </div>

        {/* Ticket Preview */}
        <div className="claim-preview">
          <p className="claim-preview__label">Boleto disponible para reclamar</p>

          <div className="claim-ticket-card">
            <h2 className="claim-ticket-card__event">{ticketInfo?.event_name}</h2>
            <div className="claim-ticket-card__meta">
              {ticketInfo?.event_date && (
                <div className="claim-ticket-card__row">
                  <CalendarIcon size={13} />
                  <span>{formatDate(ticketInfo.event_date)}</span>
                </div>
              )}
              <div className="claim-ticket-card__row">
                <MapPinIcon size={13} />
                <span>{ticketInfo?.section_name || 'General'}</span>
              </div>
            </div>
            <div className="claim-ticket-card__from">
              <UserIcon size={13} />
              Enviado por: <strong>{ticketInfo?.owner_name}</strong>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="claim-description">
          <strong>{ticketInfo?.owner_name}</strong> quiere transferirte este boleto.
          Al aceptar, el boleto quedara registrado en tu cuenta y el codigo del emisor
          sera invalidado permanentemente.
        </p>

        {/* Timer */}
        <div className={`claim-timer ${isUrgent ? 'claim-timer--expired' : ''}`}>
          <ClockIcon size={14} />
          {isUrgent
            ? `Expira pronto: ${formatSeconds(secondsLeft)}`
            : `Enlace valido por: ${formatSeconds(secondsLeft)}`}
        </div>

        {/* Actions */}
        <div className="claim-actions">
          <button
            id="claim-accept-btn"
            className="claim-btn claim-btn--accept"
            onClick={handleClaim}
            disabled={state === STATE.CLAIMING}
          >
            {state === STATE.CLAIMING
              ? <><span className="claim-spinner" /> Procesando...</>
              : <>
                  <ShieldIcon size={16} />
                  {user ? 'Reclamar boleto a mi nombre' : 'Iniciar sesion para reclamar'}
                </>
            }
          </button>
          <button className="claim-btn claim-btn--secondary" onClick={() => navigate('/')}>
            Rechazar transferencia
          </button>
        </div>
      </div>
    </div>
  );
}
