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
      className="event-hero-container"
    >
      {/* Media: imagen o video */}
      {imageUrl && (
        isVideo ? (
          tiktokId ? (
            <iframe
              src={`https://www.tiktok.com/embed/${tiktokId}`}
              className="event-hero-media"
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
              className="event-hero-media"
            />
          )
        ) : (
          <img
            src={imageUrl}
            alt={event.name}
            className="event-hero-media"
          />
        )
      )}

      {/* Gradiente inferior para legibilidad */}
      <div className="event-hero-gradient" />

      {/* Info overlay en la parte inferior */}
      <div className="event-hero-info">
        <div className="event-hero-meta-row">
          <span className="event-hero-meta-pill">
            <Icon name="calendar" size={12} />
            {formatDate(displayDate)}
          </span>
          {displayTime && formatTime(displayTime) && (
            <span className="event-hero-meta-pill">
              <Icon name="clock" size={12} />
              {formatTime(displayTime)} hrs
            </span>
          )}
          <span className="event-hero-meta-pill">
            <Icon name="mapPin" size={12} />
            {displayVenue}
            {displayCity && displayCity !== displayVenue ? `, ${displayCity}` : ""}
          </span>
        </div>

        <h1 className="event-hero-title">{event.name}</h1>
      </div>

      {/* Redes Sociales — top right */}
      <div className="event-hero-socials">
        <span className="event-hero-socials-label">REDES</span>
        <a
          href="#instagram"
          className="event-hero-social-link"
          onClick={e => e.preventDefault()}
        >
          <Icon name="instagram" size={18} />
        </a>
        <a
          href="#facebook"
          className="event-hero-social-link"
          onClick={e => e.preventDefault()}
        >
          <Icon name="facebook" size={18} />
        </a>
        <a
          href="#twitter"
          className="event-hero-social-link"
          onClick={e => e.preventDefault()}
        >
          <Icon name="twitter" size={18} />
        </a>
      </div>
    </div>
  );
};

export default EventHero;
