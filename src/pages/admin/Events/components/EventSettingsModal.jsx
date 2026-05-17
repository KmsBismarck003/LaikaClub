import React, { useState, useEffect } from 'react'
import { Modal, Button, Icon, Input, Badge } from '../../../../components'
import { eventAPI } from '../../../../services/api'
import { useNotification } from '../../../../context/NotificationContext'

const EventSettingsModal = ({ isOpen, onClose, event, onUpdate }) => {
  const { success, error: showError } = useNotification()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    ads_enabled: false,
    max_ads: 5,
    merch_enabled: false,
    metrics_enabled: false,
    status: 'draft'
  })

  useEffect(() => {
    if (event) {
      setFormData({
        ads_enabled: !!event.ads_enabled,
        max_ads: event.max_ads || 5,
        merch_enabled: !!event.merch_enabled,
        metrics_enabled: !!event.metrics_enabled,
        status: event.status || 'draft'
      })
    }
  }, [event])

  const handleToggle = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await eventAPI.update(event.id, formData)
      success('Configuración del evento actualizada')
      onUpdate()
      onClose()
    } catch (err) {
      showError('Error al actualizar la configuración')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configuración: ${event?.name}`}
      size="medium"
      className="event-settings-modal"
    >
      <form onSubmit={handleSubmit} className="event-settings-form">
        <div className="settings-section">
          <h4><Icon name="settings" size={16} /> Permisos y Funciones</h4>
          
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-title">Anuncios / Publicidad</span>
              <p className="setting-desc">Permitir al gestor subir banners publicitarios para este evento.</p>
            </div>
            <div className="setting-control">
              <label className="laika-switch">
                <input 
                  type="checkbox" 
                  checked={formData.ads_enabled} 
                  onChange={() => handleToggle('ads_enabled')} 
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          {formData.ads_enabled && (
            <div className="setting-sub-item">
              <Input
                label="Cantidad máxima de anuncios"
                type="number"
                name="max_ads"
                value={formData.max_ads}
                onChange={handleChange}
                min="1"
                max="20"
              />
            </div>
          )}

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-title">Métricas y Analíticas</span>
              <p className="setting-desc">Habilitar el panel de estadísticas avanzadas para el gestor.</p>
            </div>
            <div className="setting-control">
              <label className="laika-switch">
                <input 
                  type="checkbox" 
                  checked={formData.metrics_enabled} 
                  onChange={() => handleToggle('metrics_enabled')} 
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-title">Venta de Mercancía</span>
              <p className="setting-desc">Habilitar el catálogo de productos y souvenirs para este evento.</p>
            </div>
            <div className="setting-control">
              <label className="laika-switch">
                <input 
                  type="checkbox" 
                  checked={formData.merch_enabled} 
                  onChange={() => handleToggle('merch_enabled')} 
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-section" style={{ marginTop: '1.5rem' }}>
          <h4><Icon name="activity" size={16} /> Estado Global</h4>
          <div className="form-group">
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
              className="input-field"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
            >
              <option value="draft">Borrador (Oculto)</option>
              <option value="published">Publicado (Visible)</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>

      <style>{`
        .event-settings-form {
          padding: 1rem;
        }
        .settings-section h4 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.75rem;
          color: var(--primary);
          margin-bottom: 1.25rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 800;
        }
        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid var(--border-color);
        }
        .setting-info {
          flex: 1;
          padding-right: 2rem;
        }
        .setting-title {
          display: block;
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text-primary);
        }
        .setting-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 4px;
          line-height: 1.4;
        }
        .setting-sub-item {
          padding: 1.5rem;
          background: var(--bg-secondary);
          border-radius: 12px;
          margin: 10px 0;
          border: 1px solid var(--border-color);
        }
        
        /* Premium Switch Styles */
        .laika-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 26px;
          flex-shrink: 0;
        }
        .laika-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #e2e8f0;
          transition: .3s;
          border: 1px solid #cbd5e1;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .3s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        input:checked + .slider {
          background-color: #000;
          border-color: #000;
        }
        input:checked + .slider:before {
          transform: translateX(24px);
        }
        .slider.round {
          border-radius: 34px;
        }
        .slider.round:before {
          border-radius: 50%;
        }
        
        .setting-control {
          display: flex;
          align-items: center;
        }
      `}</style>
    </Modal>
  )
}

export default EventSettingsModal
