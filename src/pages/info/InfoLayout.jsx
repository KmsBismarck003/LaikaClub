import React from 'react'
import './InfoLayout.css'

const InfoLayout = ({ 
  title, 
  subtitle, 
  badge = 'LAIKA Club Institucional', 
  lastUpdated = 'Noviembre 2026', 
  children 
}) => {
  return (
    <div className="info-page-container">
      <div className="info-header">
        {badge && <span className="info-badge">{badge}</span>}
        <h1 className="info-title">{title}</h1>
        {subtitle && <p className="info-subtitle">{subtitle}</p>}
        {lastUpdated && (
          <div className="info-meta">
            <span className="last-updated">
              Vigencia y Actualización: <strong>{lastUpdated}</strong>
            </span>
          </div>
        )}
      </div>
      <div className="info-content-wrapper">
        <div className="info-card-bento">
          {children}
        </div>
      </div>
    </div>
  )
}

export default InfoLayout
