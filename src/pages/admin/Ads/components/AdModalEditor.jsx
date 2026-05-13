import React from 'react';
import { Modal, Input, Button } from '../../../../components';
import { getImageUrl } from '../../../../utils/imageUtils';
import PreviewMonitor from '../../../../components/Admin/PreviewMonitor';
import AdAnalytics from './AdAnalytics';
import api from '../../../../services/api';

const AdModalEditor = ({ 
  isOpen, 
  onClose, 
  editingAd, 
  formData, 
  setFormData, 
  handleSubmit, 
  clicksData, 
  loadingClicks,
  success,
  showError
}) => {
  return (
    <Modal
      isOpen={isOpen}
      title={editingAd ? 'Editar Anuncio' : 'Nuevo Anuncio'}
      onClose={onClose}
    >
      <div className="split-modal-container">
        <div className="split-modal-form">
          <form onSubmit={handleSubmit} className="ad-form">
            <div className="form-group mb-3">
              <label className="input-label">Título</label>
              <Input
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Ej. Promo Verano"
              />
            </div>

            <div className="form-group mb-3">
              <label className="input-label">Posición</label>
              <select
                className="input"
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                value={formData.position}
                onChange={e => setFormData({ ...formData, position: e.target.value })}
              >
                <option value="main">Principal (1098x342)</option>
                <option value="side_left">Lateral Izquierdo (160x600)</option>
                <option value="side_right">Lateral Derecho (160x600)</option>
              </select>
            </div>

            <div className="form-group mb-3">
              <label className="input-label">Enlace de Redirección (Opcional)</label>
              <Input
                value={formData.link_url}
                onChange={e => setFormData({ ...formData, link_url: e.target.value })}
                placeholder="https://ejemplo.com/evento"
              />
              <p className="help-text" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                URL a la que se dirigirá al usuario al hacer clic.
              </p>
            </div>

            <div className="form-group mb-3">
              <label className="input-label">Subir Imagen</label>
              <div className="upload-container">
                <Input
                  type="file"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      try {
                        const objectUrl = URL.createObjectURL(file);
                        setFormData({ ...formData, image_url: objectUrl });
                        const response = await api.ads.upload(file);
                        const finalUrl = response.url.startsWith('http')
                          ? response.url
                          : `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${response.url}`;
                        setFormData(prev => ({ ...prev, image_url: finalUrl }));
                        success('Imagen subida correctamente');
                      } catch (error) {
                        console.error('Upload error:', error);
                        showError('Error al subir imagen');
                      }
                    }
                  }}
                  accept="image/*"
                />
                <p className="help-text" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                  O ingresa una URL manualmente:
                </p>
                <Input
                  value={formData.image_url}
                  onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                  required
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="image-preview-container mt-3" style={{ position: 'relative' }}>
              <p className="help-text" style={{ fontSize: '0.7rem', marginBottom: '0.3rem', color: 'var(--accent-color)', fontWeight: 600 }}>
                💡 Tip: Arrastra la imagen al monitor de la derecha para elegir posición.
              </p>
              <div className="preview-box" style={{ 
                  width: '100%', 
                  height: '140px', 
                  borderRadius: '12px', 
                  backgroundColor: '#222', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  overflow: 'hidden', 
                  border: '1px solid #333' 
              }}>
                {formData.image_url ? (
                  <img
                    src={getImageUrl(formData.image_url)}
                    alt="Preview"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', 'ad-image');
                      e.currentTarget.style.opacity = '0.5';
                    }}
                    onDragEnd={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'grab' }}
                  />
                ) : (
                  <span style={{ color: '#555', fontSize: '0.8rem' }}>Sin imagen</span>
                )}
              </div>
            </div>

            <div className="form-group mb-3">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={e => setFormData({ ...formData, active: e.target.checked })}
                  style={{ width: '1.2rem', height: '1.2rem' }}
                />
                Activo
              </label>
            </div>

            <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
              <Button type="submit" variant="primary">Guardar</Button>
            </div>
          </form>
        </div>
        <div className="split-modal-preview">
          <PreviewMonitor
            type="ad"
            data={formData}
            title="AD PLACEMENT MONITOR"
            onPositionSelect={(pos) => setFormData({ ...formData, position: pos })}
          />

          {editingAd && (
            <AdAnalytics 
              clicksData={clicksData} 
              loadingClicks={loadingClicks} 
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AdModalEditor;
