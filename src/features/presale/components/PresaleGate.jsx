import React, { useState } from 'react';
import './PresaleGate.css';

/**
 * PresaleGate — Pantalla de bloqueo para preventas exclusivas.
 *
 * Responsabilidad única: capturar el número de tarjeta del usuario
 * y delegarle la validación al hook usePresale (via props).
 *
 * Props:
 *  @param {Object} presaleState  - Estado de preventa { bankName, start, end }
 *  @param {string} binInput      - Valor actual del input (controlado por el padre)
 *  @param {Function} onBinChange - Handler para cambios del input
 *  @param {string} validationError - Mensaje de error de validación
 *  @param {boolean} isValidating   - Spinner de carga
 *  @param {Function} onSubmit    - Función a llamar al presionar "Verificar"
 */
const PresaleGate = ({
  presaleState,
  binInput,
  onBinChange,
  validationError,
  isValidating,
  onSubmit,
}) => {
  const { bankName, start, end } = presaleState;

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSubmit(binInput);
  };

  return (
    <div className="presale-gate-overlay">
      <div className="presale-gate-card">
        {/* Header */}
        <div className="presale-gate-header">
          <div className="presale-lock-icon">🔒</div>
          <h2 className="presale-gate-title">Preventa Exclusiva</h2>
          {bankName && (
            <div className="presale-bank-badge">
              <span className="presale-bank-name">{bankName}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="presale-gate-body">
          <p className="presale-gate-description">
            Este evento se encuentra en período de <strong>preventa exclusiva</strong>
            {bankName ? ` para clientes ${bankName}` : ''}.
            Ingresa los primeros dígitos de tu tarjeta para verificar tu acceso.
          </p>

          {/* Date info */}
          {start && end && (
            <div className="presale-dates-info">
              <div className="presale-date-item">
                <span className="presale-date-label">Preventa hasta</span>
                <span className="presale-date-value">{formatDate(end)}</span>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="presale-input-wrapper">
            <div className="presale-card-icon">💳</div>
            <input
              id="presale-bin-input"
              className={`presale-bin-input ${validationError ? 'presale-input-error' : ''}`}
              type="text"
              inputMode="numeric"
              maxLength={16}
              placeholder="4 5 5 5 1 1 ..."
              value={binInput.replace(/(\d{4})(?=\d)/g, '$1 ').trim()}
              onChange={(e) => onBinChange(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>

          <p className="presale-input-hint">
            Solo necesitamos verificar los primeros 6 dígitos. No almacenamos este dato.
          </p>

          {/* Error message */}
          {validationError && (
            <div className="presale-error-message" role="alert">
              <span className="presale-error-icon">⚠️</span>
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="presale-gate-footer">
          <button
            className="presale-verify-btn"
            onClick={() => onSubmit(binInput)}
            disabled={isValidating || binInput.replace(/\D/g, '').length < 6}
          >
            {isValidating ? (
              <>
                <span className="presale-spinner" />
                Verificando...
              </>
            ) : (
              <>🔓 Verificar Acceso</>
            )}
          </button>
        </div>

        {/* Fine print */}
        <p className="presale-fine-print">
          Si no eres cliente {bankName || 'del banco patrocinador'}, podrás comprar cuando inicie la venta general el{' '}
          {formatDate(end)}.
        </p>
      </div>
    </div>
  );
};

export default PresaleGate;
