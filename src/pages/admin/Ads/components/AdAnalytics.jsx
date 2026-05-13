import React from 'react';
import { Badge } from '../../../../components';
import { getImageUrl } from '../../../../utils/imageUtils';

const AdAnalytics = ({ clicksData, loadingClicks }) => {
  return (
    <div className="clicks-info-section" style={{ marginTop: '2rem' }}>
      <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1rem', 
          borderBottom: '1px solid var(--border-color)', 
          paddingBottom: '0.5rem' 
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Usuarios que interactuaron</h3>
        <Badge variant="primary">{clicksData.length} Clics</Badge>
      </div>

      <div className="whatsapp-style-list" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {loadingClicks ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem' }}>Cargando...</p>
        ) : clicksData.length > 0 ? (
          clicksData.map((click, idx) => (
            <div 
              key={idx} 
              className="wa-user-item" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.8rem', 
                padding: '0.8rem', 
                borderRadius: '12px', 
                background: 'rgba(255,255,255,0.03)', 
                marginBottom: '0.5rem', 
                transition: 'background 0.2s' 
              }}
            >
              <div 
                className="wa-avatar" 
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: '#333', 
                  overflow: 'hidden', 
                  flexShrink: 0 
                }}
              >
                <img
                  src={getImageUrl(click.profile_image) || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                  alt={click.full_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="wa-info" style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                    fontWeight: 600, 
                    fontSize: '0.9rem', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis' 
                }}>
                  {click.full_name || 'Usuario Anónimo'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {click.email || 'Sin correo asociado'}
                </div>
              </div>
              <div className="wa-time" style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: 500 }}>
                {new Date(click.clicked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Aún no hay clics registrados para este anuncio.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdAnalytics;
