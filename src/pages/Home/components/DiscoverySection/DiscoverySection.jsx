import React from 'react';
import { Icon } from '../../../../components';
import { getImageUrl } from '../../../../utils/imageUtils';
import './DiscoverySection.css';

const DiscoverySection = ({ recentlyViewed, mlRecommendations, events, navigate }) => {
  return (
    <section className="discovery-container">
      {/* 0. RECOMENDACIONES DE IA (Si existen) */}
      {mlRecommendations && mlRecommendations.length > 0 && (
        <div className="discovery-section ml-recommendations" style={{ background: 'linear-gradient(to right, #1e1b4b, #312e81)', padding: '20px', borderRadius: '16px', color: 'white', marginBottom: '20px' }}>
          <header className="section-header" style={{ marginBottom: '15px' }}>
            <h2 className="section-title" style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="sparkles" size={18} /> RECOMENDADO PARA TI
            </h2>
          </header>
          <div className="most-searched-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {mlRecommendations.map(event => (
              <div key={`ml-${event.id}`} className="mini-event-card" onClick={() => navigate(`/event/${event.id}`)} style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div className="mini-card-image">
                  <img src={getImageUrl(event.image_url || event.image)} alt={event.name} />
                </div>
                <div className="mini-card-info">
                  <span className="mini-venue" style={{ color: '#93c5fd' }}>{event.venue || 'MÁS AFÍN A TI'}</span>
                  <span className="mini-name" style={{ color: 'white' }}>{event.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* 1. VISTOS RECIENTEMENTE */}
      {recentlyViewed.length > 0 && (
        <div className="discovery-section recently-viewed">
          <header className="section-header">
            <h2 className="section-title">VISTOS RECIENTEMENTE</h2>
            <div className="header-line"></div>
          </header>
          <div className="recent-pills">
            {recentlyViewed.map(item => (
              <div 
                key={`recent-${item.id}`} 
                className="recent-pill"
                onClick={() => navigate(`/event/${item.id}`)}
              >
                <img src={getImageUrl(item.image)} alt={item.name} />
                <span>{item.name}</span>
                <Icon name="check" size={14} />
              </div>
            ))}
          </div>
        </div>
      )}

      <hr className="discovery-divider" />

      {/* 2. LO MÁS BUSCADO */}
      <div className="discovery-section most-searched">
        <header className="section-header">
          <h2 className="section-title">LO MÁS BUSCADO</h2>
          <div className="header-line"></div>
        </header>
        <div className="most-searched-grid">
          {events.slice(0, 4).map(event => (
            <div key={`ms-${event.id}`} className="mini-event-card">
              <div className="mini-card-image">
                <img src={getImageUrl(event.image_url || event.image)} alt={event.name} />
              </div>
              <div className="mini-card-info">
                <span className="mini-venue">{event.venue || 'ESTADIO GNP SEGUROS'}</span>
                <span className="mini-name">{event.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DiscoverySection;
