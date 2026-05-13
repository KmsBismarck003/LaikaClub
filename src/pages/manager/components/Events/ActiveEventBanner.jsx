import React from 'react';
import { Badge } from '../../../../components';

const ActiveEventBanner = ({ event }) => {
    if (!event) return (
        <div className="event-banner-industrial empty-banner">
            <div className="banner-content">
                <Badge variant="secondary" rounded>EVENTO ACTIVO</Badge>
                <h1 className="banner-title">SIN EVENTO SELECCIONADO</h1>
                <p className="banner-subtitle">MONITOREO DE TAQUILLA EN TIEMPO REAL • ESTADIO LAIKA</p>
            </div>
        </div>
    );

    return (
        <div className="event-banner-industrial active-banner" style={{ '--banner-bg': `url(${event.image_url})` }}>
            <div className="banner-overlay" />
            <div className="banner-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <Badge variant="success" rounded dot>EVENTO ACTIVO</Badge>
                    <span className="banner-date">{new Date(event.event_date).toLocaleDateString()}</span>
                </div>
                <h1 className="banner-title">{event.name.toUpperCase()}</h1>
                <p className="banner-subtitle">{event.venue?.toUpperCase() || 'VENUE NO DEFINIDO'} • {event.category?.toUpperCase() || 'GENERAL'}</p>
            </div>
            <div className="banner-stats-mini">
                <div className="b-stat">
                    <small>VENTAS</small>
                    <span>{event.tickets_sold || 0}</span>
                </div>
                <div className="b-stat">
                    <small>PROGRESO</small>
                    <span>{Math.round(((event.tickets_sold || 0) / (event.total_tickets || 1)) * 100)}%</span>
                </div>
            </div>
        </div>
    );
};

export default ActiveEventBanner;
