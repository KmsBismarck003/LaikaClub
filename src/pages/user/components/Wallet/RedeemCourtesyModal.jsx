import React, { useState } from 'react';
import api from '../../../../services/api';
import Icon from '../../../../components/Icons/Icons';

export default function RedeemCourtesyModal({ isOpen, onClose, onSuccess, onError }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  if (!isOpen) return null;

  const handleValidate = async () => {
    if (!code || !code.trim()) {
      onError('Ingresa tu código de cortesía.');
      return;
    }
    setLoading(true);
    try {
      const clean = code.trim().toUpperCase();
      const res = await api.ticket.validateCourtesyToken(clean);
      setPreview(res);
    } catch (err) {
      onError(err?.message || 'Código de cortesía inválido o no encontrado.');
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!code || !code.trim()) {
      onError('Ingresa tu código de cortesía.');
      return;
    }

    setLoading(true);
    try {
      const clean = code.trim().toUpperCase();
      const res = await api.ticket.claimCourtesy(clean);
      onSuccess(res.message || '¡Boleto de cortesía canjeado con éxito!');
      onClose();
    } catch (err) {
      onError(err?.message || 'No se pudo canjear el boleto de cortesía.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1.5rem'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#0e0e14',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span
              style={{
                fontSize: '.62rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: '#8b5cf6',
                display: 'block',
                marginBottom: '.25rem'
              }}
            >
              Centro de Canje Oficial
            </span>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>
              Canjear Cortesía
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888',
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ margin: 0, fontSize: '.8rem', color: '#888', lineHeight: 1.5 }}>
          Ingresa el código alfanumérico que te proporcionó el organizador o patrocinador (ej.{' '}
          <code style={{ color: '#a78bfa' }}>LAIKA-COR-XXXX</code>) para transferir el boleto a tu nombre.
        </p>

        <form onSubmit={handleClaim} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <input
              type="text"
              placeholder="LAIKA-COR-XXXXXX"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setPreview(null);
              }}
              style={{
                flex: 1,
                background: '#16161f',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '.8rem 1rem',
                color: '#fff',
                fontSize: '.95rem',
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '1px',
                outline: 'none'
              }}
              required
            />
            <button
              type="button"
              onClick={handleValidate}
              disabled={loading || !code.trim()}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                borderRadius: '12px',
                padding: '0 1rem',
                fontSize: '.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Verificar
            </button>
          </div>

          {preview && (
            <div
              style={{
                background: 'rgba(139, 92, 246, 0.08)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '.4rem',
                fontSize: '.8rem'
              }}
            >
              <div style={{ fontWeight: 800, color: '#fff', fontSize: '.9rem' }}>
                {preview.event_name || 'Evento Oficial'}
              </div>
              <div style={{ color: '#aaa' }}>
                Fecha:{' '}
                <strong style={{ color: '#fff' }}>
                  {preview.event_date ? new Date(preview.event_date).toLocaleDateString('es-MX') : 'Por confirmar'}
                </strong>
                {preview.event_time && ` • ${preview.event_time}`}
              </div>
              <div style={{ color: '#aaa' }}>
                Zona: <strong style={{ color: '#a78bfa' }}>{preview.section_name || 'General'}</strong>
                {preview.motive && ` • Motivo: ${preview.motive}`}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.75rem', marginTop: '.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#888',
                borderRadius: '12px',
                padding: '.7rem 1.25rem',
                fontSize: '.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              style={{
                background: '#8b5cf6',
                border: 'none',
                color: '#fff',
                borderRadius: '12px',
                padding: '.7rem 1.5rem',
                fontSize: '.75rem',
                fontWeight: 900,
                letterSpacing: '.5px',
                cursor: 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Reclamando...' : 'Canjear Boleto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
