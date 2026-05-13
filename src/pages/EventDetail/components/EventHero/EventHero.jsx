import React from 'react';
import { Icon } from "../../../../components";
import "./EventHero.css";

const EventHero = ({
  heroRef,
  imageUrl,
  event,
  isVideo,
  tiktokId,
  videoRef,
  formatDate,
  displayDate,
  formatTime,
  displayTime,
  displayVenue,
  displayCity,
  navigate
}) => {
  return (
    <div 
      ref={heroRef}
      className="hero-poster-container"
      style={{
        width: "100%",
        height: "380px",
        borderRadius: "24px",
        overflow: "hidden",
        position: "relative",
        marginBottom: "1.5rem",
        border: "1px solid rgba(255, 255, 255, 0.25)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)"
      }}>
      {imageUrl && (
        isVideo ? (
          tiktokId ? (
            <iframe
              src={`https://www.tiktok.com/embed/${tiktokId}`}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                display: "block",
                backgroundColor: "#000",
                transform: "scale(1.05)",
                transformOrigin: "center center"
              }}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              src={imageUrl}
              autoPlay
              loop
              muted
              playsInline
              poster="https://images.pexels.com/photos/13082773/pexels-photo-13082773.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center top",
                display: "block",
                backgroundColor: "#111"
              }}
            />
          )
        ) : (
          <img
            src={imageUrl}
            alt={event.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
              display: "block",
            }}
          />
        )
      )}

      {/* Barra superior Glassmorphism */}
      <div className="event-meta-header" style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        margin: 0,
        padding: "1.5rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 10,
        borderRadius: "0",
        background: "rgba(255,255,255,0.05)",
        border: "none",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "none"
      }}>
        <div>
          <h1 style={{ fontSize: "2.2rem", margin: 0, fontWeight: 950, textTransform: "none", letterSpacing: "-0.5px", color: "#fff" }}>
            {event.name}
          </h1>
          <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
            <span><Icon name="calendar" size={14} style={{ marginRight: '4px', verticalAlign: '-2px' }}/> {formatDate(displayDate)}</span>
            {displayTime && (
              <span><Icon name="clock" size={14} style={{ marginRight: '4px', verticalAlign: '-2px' }}/> {formatTime(displayTime)} hrs</span>
            )}
            <span>
              <Icon name="mapPin" size={14} style={{ marginRight: '4px', verticalAlign: '-2px' }}/> {displayVenue}{" "}
              {displayCity && displayCity !== displayVenue ? `, ${displayCity}` : ""}
            </span>
          </div>
        </div>

        {/* Redes Sociales */}
        <div className="artist-socials" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
           <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.6)', letterSpacing: '2px' }}>REDES:</span>
           <a href="#instagram" onClick={e => e.preventDefault()} style={{ color: '#fff', opacity: 0.7, transition: 'opacity 0.2s' }} onMouseOver={e=>e.currentTarget.style.opacity=1} onMouseOut={e=>e.currentTarget.style.opacity=0.7}><Icon name="instagram" size={18} /></a>
           <a href="#facebook" onClick={e => e.preventDefault()} style={{ color: '#fff', opacity: 0.7, transition: 'opacity 0.2s' }} onMouseOver={e=>e.currentTarget.style.opacity=1} onMouseOut={e=>e.currentTarget.style.opacity=0.7}><Icon name="facebook" size={18} /></a>
           <a href="#twitter" onClick={e => e.preventDefault()} style={{ color: '#fff', opacity: 0.7, transition: 'opacity 0.2s' }} onMouseOver={e=>e.currentTarget.style.opacity=1} onMouseOut={e=>e.currentTarget.style.opacity=0.7}><Icon name="twitter" size={18} /></a>
        </div>
      </div>
    </div>
  );
};

export default EventHero;
