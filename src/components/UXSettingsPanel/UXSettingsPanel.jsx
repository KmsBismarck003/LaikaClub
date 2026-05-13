/**
 * @file components/UXSettingsPanel/UXSettingsPanel.jsx
 * @description Panel de configuración visual global.
 *
 * Ejemplo canónico de un componente que:
 *  1. NO tiene lógica de negocio (delega a UXContext)
 *  2. Es reutilizable (puede renderizarse en cualquier layout)
 *  3. Responsabilidad única: presentar y togglear ajustes UX
 *
 * PRINCIPIO SOLID — S: este componente solo renderiza ajustes de UX.
 * PRINCIPIO SOLID — D: depende del contexto abstracto, no de localStorage.
 *
 * @layer components/specialty
 */

import React from 'react'
import { useUX } from '../../context'
import './UXSettingsPanel.css'

/**
 * Panel de ajustes de experiencia de usuario.
 * Muestra controles para animaciones, densidad y otras preferencias visuales.
 *
 * @param {Object}   props
 * @param {boolean}  [props.compact=false] - Modo compacto para sidebar
 * @param {Function} [props.onClose]       - Callback para cerrar el panel
 */
const UXSettingsPanel = ({ compact = false, onClose }) => {
  const {
    animationsEnabled,
    reducedMotion,
    density,
    toggleAnimations,
    setDensity,
    resetUXSettings,
  } = useUX()

  const densityOptions = [
    { value: 'compact',     label: 'Compacto',    icon: '▤' },
    { value: 'comfortable', label: 'Cómodo',      icon: '▦' },
    { value: 'spacious',    label: 'Espacioso',   icon: '▧' },
  ]

  return (
    <div className={`ux-panel ${compact ? 'ux-panel--compact' : ''}`}>
      {!compact && (
        <div className="ux-panel__header">
          <h3 className="ux-panel__title">⚙️ Preferencias Visuales</h3>
          {onClose && (
            <button className="ux-panel__close" onClick={onClose} aria-label="Cerrar">
              ✕
            </button>
          )}
        </div>
      )}

      {/* ─── Toggle de Animaciones ── */}
      <div className="ux-panel__section">
        <label className="ux-panel__label">
          {compact ? '🎞' : 'Animaciones'}
        </label>
        <button
          className={`ux-toggle ${animationsEnabled ? 'ux-toggle--on' : 'ux-toggle--off'}`}
          onClick={toggleAnimations}
          disabled={reducedMotion}
          title={
            reducedMotion
              ? 'Tu sistema tiene "movimiento reducido" activado'
              : animationsEnabled
              ? 'Desactivar animaciones'
              : 'Activar animaciones'
          }
          aria-pressed={animationsEnabled}
        >
          <span className="ux-toggle__thumb" />
        </button>
        {reducedMotion && !compact && (
          <span className="ux-panel__hint">Sistema: movimiento reducido</span>
        )}
      </div>

      {/* ─── Densidad de Interfaz ── */}
      {!compact && (
        <div className="ux-panel__section">
          <label className="ux-panel__label">Densidad</label>
          <div className="ux-density-group">
            {densityOptions.map(option => (
              <button
                key={option.value}
                className={`ux-density-btn ${density === option.value ? 'ux-density-btn--active' : ''}`}
                onClick={() => setDensity(option.value)}
                title={option.label}
                aria-pressed={density === option.value}
              >
                <span className="ux-density-btn__icon">{option.icon}</span>
                <span className="ux-density-btn__label">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Reset ── */}
      {!compact && (
        <div className="ux-panel__footer">
          <button
            className="ux-panel__reset"
            onClick={resetUXSettings}
          >
            Restablecer predeterminados
          </button>
        </div>
      )}
    </div>
  )
}

export default UXSettingsPanel
