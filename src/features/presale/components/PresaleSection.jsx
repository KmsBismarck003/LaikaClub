import React, { useState } from 'react';
import { MEXICAN_BANKS, getDefaultBinsCsv } from '../constants/banks';
import './PresaleSection.css';

/**
 * PresaleSection — Sección de configuración de preventa para el formulario del manager.
 *
 * Responsabilidad única: renderizar los campos de configuración de preventa
 * y notificar al padre cuando cambien (vía onChange).
 *
 * Props:
 *  @param {Object}   presaleData  - { presale_enabled, presale_bank_name, presale_bins, presale_start, presale_end }
 *  @param {Function} onChange     - Callback: (fieldName, value) => void
 */
const PresaleSection = ({ presaleData = {}, onChange }) => {
  const [selectedBankId, setSelectedBankId] = useState('custom');

  const {
    presale_enabled = false,
    presale_bank_name = '',
    presale_bins = '',
    presale_start = '',
    presale_end = '',
  } = presaleData;

  const handleToggle = (e) => {
    onChange('presale_enabled', e.target.checked);
  };

  const handleBankSelect = (bankId) => {
    setSelectedBankId(bankId);
    const bank = MEXICAN_BANKS.find((b) => b.id === bankId);
    if (!bank) return;

    onChange('presale_bank_name', bank.id === 'custom' ? presale_bank_name : bank.name);
    if (bank.id !== 'custom' && bank.commonBins.length > 0) {
      onChange('presale_bins', getDefaultBinsCsv(bankId));
    }
  };

  return (
    <div className="presale-section">
      {/* Toggle principal */}
      <div className="presale-section-header">
        <div className="presale-section-title-row">
          <span className="presale-section-icon">🎟️</span>
          <div>
            <h4 className="presale-section-title">Preventa Exclusiva por Banco</h4>
            <p className="presale-section-subtitle">
              Permite que solo clientes de un banco específico puedan comprar antes de la venta general.
            </p>
          </div>
        </div>
        <label className="presale-toggle-label" htmlFor="presale-enabled-toggle">
          <input
            id="presale-enabled-toggle"
            type="checkbox"
            className="presale-toggle-input"
            checked={presale_enabled}
            onChange={handleToggle}
          />
          <span className="presale-toggle-track">
            <span className="presale-toggle-thumb" />
          </span>
        </label>
      </div>

      {/* Configuración (visible solo si está habilitado) */}
      {presale_enabled && (
        <div className="presale-config-grid">

          {/* Selector de banco */}
          <div className="presale-field presale-field--full">
            <label className="presale-field-label">Banco Patrocinador</label>
            <div className="presale-bank-grid">
              {MEXICAN_BANKS.map((bank) => (
                <button
                  key={bank.id}
                  type="button"
                  className={`presale-bank-chip ${selectedBankId === bank.id ? 'presale-bank-chip--active' : ''}`}
                  onClick={() => handleBankSelect(bank.id)}
                >
                  <span className="presale-bank-chip-logo">{bank.logo}</span>
                  <span className="presale-bank-chip-name">
                    {bank.id === 'custom' ? 'Otro' : bank.name.replace(' México', '').replace(' Bancomer', '')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Nombre del banco (editable si es personalizado) */}
          <div className="presale-field">
            <label className="presale-field-label" htmlFor="presale-bank-name">
              Nombre Visible del Banco
            </label>
            <input
              id="presale-bank-name"
              type="text"
              className="presale-text-input"
              placeholder="Ej. BBVA"
              value={presale_bank_name}
              onChange={(e) => onChange('presale_bank_name', e.target.value)}
            />
          </div>

          {/* BINs */}
          <div className="presale-field presale-field--full">
            <label className="presale-field-label" htmlFor="presale-bins">
              BINs Permitidos{' '}
              <span className="presale-field-hint">(Primeros 6 dígitos de las tarjetas, separados por coma)</span>
            </label>
            <textarea
              id="presale-bins"
              className="presale-text-input presale-textarea"
              placeholder="415231, 455511, 402766, 446200"
              value={presale_bins}
              onChange={(e) => onChange('presale_bins', e.target.value)}
              rows={3}
            />
            <p className="presale-bins-hint">
              💡 Al seleccionar un banco arriba se autocompletarán los BINs más comunes. Puedes editarlos o añadir más.
            </p>
          </div>

          {/* Fechas */}
          <div className="presale-field">
            <label className="presale-field-label" htmlFor="presale-start">
              Inicio de la Preventa
            </label>
            <input
              id="presale-start"
              type="datetime-local"
              className="presale-text-input"
              value={presale_start}
              onChange={(e) => onChange('presale_start', e.target.value)}
            />
          </div>

          <div className="presale-field">
            <label className="presale-field-label" htmlFor="presale-end">
              Fin de la Preventa
              <span className="presale-field-hint"> (Inicio de venta general)</span>
            </label>
            <input
              id="presale-end"
              type="datetime-local"
              className="presale-text-input"
              value={presale_end}
              onChange={(e) => onChange('presale_end', e.target.value)}
            />
          </div>

          {/* Preview de configuración */}
          {presale_bank_name && presale_start && presale_end && (
            <div className="presale-config-preview presale-field--full">
              <span className="presale-preview-dot" />
              <span>
                Preventa exclusiva <strong>{presale_bank_name}</strong> activa del{' '}
                <strong>{new Date(presale_start).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}</strong>
                {' '}al{' '}
                <strong>{new Date(presale_end).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}</strong>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PresaleSection;
