import React from 'react';
import './HeroSection.css';

const HeroSection = ({ 
  title = "Descubre Eventos", 
  accentText = "Increíbles", 
  subtitle = "Conciertos, deportes, teatro y festivales. Tu próxima experiencia inolvidable está aquí.",
  backgroundImage = "/117.png"
}) => {
  return (
    <section className="hero">
      <div className="hero-bg">
        <img src={backgroundImage} alt="" className="hero-bg-image" loading="eager" />
        <div className="hero-bg-overlay" />
      </div>
      <div className="hero-content">
        <h1 className="hero-title">
          {title} <span className="hero-title-accent">{accentText}</span>
        </h1>
        <p className="hero-subtitle">{subtitle}</p>
      </div>
    </section>
  );
};

export default HeroSection;
