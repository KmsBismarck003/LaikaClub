import React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import '../../styles/manager.css';
import { getImageUrl } from '../../utils/imageUtils';

const formatTime = (time) => {
    if (!time) return '';
    const str = String(time);
    if (str.includes(':')) return str.substring(0, 5);
    if (!isNaN(time)) {
        const totalSec = parseInt(time, 10);
        const h = Math.floor(totalSec / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
        return `${h}:${m}`;
    }
    return '';
};

/**
 * EventCardPreview
 * Reuses the Home page Card style to show a live preview.
 */
const EventCardPreview = ({ eventData }) => {
    // Default placeholder data if fields are empty
    const {
        name = "Nombre del Evento",
        description = "Descripción breve del evento...",
        event_date,
        event_time,
        location = "Ubicación",
        price = 0,
        image_url,
        category = "concert"
    } = eventData;

    // Simulate formatting
    const formattedDate = event_date ? new Date(event_date).toLocaleDateString() : 'DD/MM/YYYY';
    const formattedTime = formatTime(event_time) || 'HH:MM';

    // Fallback image if none provided
    const displayImage = getImageUrl(image_url);

    return (
        <div className="preview-container" style={{ padding: '2rem', background: '#f1f5f9', borderRadius: '16px', display: 'flex', justifyContent: 'center' }}>
            <div className="premium-card-wrapper" style={{ width: '100%', maxWidth: '320px' }}>
                <Card
                    className="premium-event-card"
                    style={{ 
                        padding: 0, 
                        overflow: 'hidden', 
                        borderRadius: '24px', 
                        border: 'none',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                        background: '#fff',
                        position: 'relative',
                        transition: 'transform 0.3s ease'
                    }}
                >
                    {/* Imagen con Overlay */}
                    <div className="premium-image-box" style={{ position: 'relative', height: '380px' }}>
                        <img
                            src={displayImage}
                            alt={name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{ 
                            position: 'absolute', 
                            top: '16px', 
                            right: '16px', 
                            background: 'rgba(255,255,255,0.9)', 
                            backdropFilter: 'blur(10px)',
                            padding: '6px 12px',
                            borderRadius: '100px',
                            fontSize: '0.65rem',
                            fontWeight: '900',
                            letterSpacing: '0.05em',
                            color: '#000'
                        }}>
                            {category.toUpperCase()}
                        </div>
                        
                        {/* Gradient Overlay */}
                        <div style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            left: 0, 
                            right: 0, 
                            height: '60%', 
                            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)' 
                        }} />
                        
                        {/* Content Floating on Image */}
                        <div style={{ 
                            position: 'absolute', 
                            bottom: '20px', 
                            left: '20px', 
                            right: '20px',
                            color: '#fff'
                        }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, lineHeight: 1.1, textTransform: 'uppercase' }}>
                                {name}
                            </h3>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', fontSize: '0.7rem', opacity: 0.9, fontWeight: '600' }}>
                                <span>📅 {formattedDate}</span>
                                <span>🕒 {formattedTime}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Info */}
                    <div className="premium-card-footer" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className="price-tag">
                            <p style={{ margin: 0, fontSize: '0.6rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Desde</p>
                            <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>
                                ${parseFloat(price).toFixed(2)}
                            </h4>
                        </div>
                        <Button 
                            variant="primary" 
                            style={{ 
                                borderRadius: '12px', 
                                padding: '12px 20px', 
                                fontSize: '0.75rem', 
                                fontWeight: '800',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        >
                            VER BOLETOS
                        </Button>
                    </div>
                </Card>
                <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#64748b', marginTop: '1.5rem', fontWeight: '500' }}>
                    Esta es una previsualización de cómo se verá el evento en la plataforma principal.
                </p>
            </div>
        </div>
    );
};

export default EventCardPreview;
