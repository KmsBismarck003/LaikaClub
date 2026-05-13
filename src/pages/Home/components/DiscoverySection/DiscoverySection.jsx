import React from 'react';
import { Icon } from '../../../../components';
import { getImageUrl } from '../../../../utils/imageUtils';
import './DiscoverySection.css';

const DiscoverySection = ({ recentlyViewed, events, navigate }) => {
  return (
    <section className="discovery-container">
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

      <hr className="discovery-divider" />

      {/* 3. DESCUBRE */}
      <div className="discovery-section discover-grid">
        <header className="section-header">
          <h2 className="section-title">DESCUBRE</h2>
          <div className="header-line"></div>
        </header>
        <div className="category-banners">
          <div className="category-banner theme-help">
            <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600" alt="Ayuda" loading="lazy" />
            <div className="banner-overlay">
              <span className="banner-subtitle">ESTAMOS AQUÍ PARA TI</span>
              <h3 className="banner-title">BOTÓN DE AYUDA</h3>
              <span className="banner-link">VER MÁS</span>
            </div>
          </div>
          <div className="category-banner theme-vip">
            <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600" alt="VIP" loading="lazy" />
            <div className="banner-overlay">
              <span className="banner-subtitle">TU PLAN COMIENZA AQUÍ</span>
              <h3 className="banner-title">PAQUETES VIP</h3>
              <span className="banner-link">VER MÁS</span>
            </div>
          </div>
          <div className="category-banner theme-family">
            <img src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600" alt="Familiares" loading="lazy" />
            <div className="banner-overlay">
              <span className="banner-subtitle">DISFRUTA EN FAMILIA</span>
              <h3 className="banner-title">FAMILIARES</h3>
              <span className="banner-link">VER MÁS</span>
            </div>
          </div>
        </div>
      </div>

      <hr className="discovery-divider" />

      {/* 4. CIUDADES MÁS BUSCADAS */}
      <div className="discovery-section searched-cities">
        <header className="section-header">
          <h2 className="section-title">CIUDADES MÁS BUSCADAS</h2>
          <div className="header-line"></div>
        </header>
        <div className="cities-grid">
          <div className="city-card">
            <img src="https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=400" alt="CDMX" loading="lazy" />
            <div className="city-overlay">
              <span className="city-name-tag">Ciudad de México</span>
            </div>
          </div>
          <div className="city-card">
            <img src="https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400" alt="Guadalajara" loading="lazy" />
            <div className="city-overlay">
              <span className="city-name-tag">Guadalajara</span>
            </div>
          </div>
          <div className="city-card">
            <img src="https://images.unsplash.com/photo-1577017040065-650ee4d43339?w=400" alt="Monterrey" loading="lazy" />
            <div className="city-overlay">
              <span className="city-name-tag">Monterrey</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscoverySection;
