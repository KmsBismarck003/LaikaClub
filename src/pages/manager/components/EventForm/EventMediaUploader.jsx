import React from 'react';
import Input from '../../../../components/Input';

const EventMediaUploader = ({ image_url, uploading, onUpload, onChange }) => (
    <div className="form-group mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-3">Imagen del Evento (Vector Preview)</label>

        <div
            className="image-upload-dropzone"
            style={{
                border: '2px dashed #e2e8f0',
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: '#f8fafc',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
            }}
            onClick={() => document.getElementById('event-image-upload').click()}
        >
            <input
                id="event-image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => onUpload(e.target.files[0])}
                style={{ display: 'none' }}
                disabled={uploading}
            />

            {image_url ? (
                <div className="upload-preview-overlay">
                    <img src={image_url} alt="Preview" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                    <div style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.8rem' }}>Haz clic para cambiar la foto</div>
                </div>
            ) : (
                <div className="upload-placeholder">
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</div>
                    <p style={{ fontWeight: '600', color: '#1e293b' }}>{uploading ? 'Subiendo...' : 'Haz clic para subir la foto del evento'}</p>
                </div>
            )}
        </div>

        <div style={{ marginTop: '1rem' }}>
            <Input
                label="O pega una URL de imagen:"
                name="image_url"
                value={image_url}
                onChange={onChange}
                placeholder="https://..."
            />
        </div>
    </div>
);

export default EventMediaUploader;
