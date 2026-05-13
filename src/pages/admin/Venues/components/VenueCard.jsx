import React from 'react';
import { Card, Badge, Icon, Button } from '../../../../components';
import { useNavigate } from 'react-router-dom';

const IsometricBuilding = ({ type }) => {
    const renderModel = () => {
        const glowStyle = { filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.8))' };
        
        switch(type) {
            case 'stadium':
                return (
                    <g transform="translate(10, 10) scale(0.8)" style={glowStyle}>
                        {/* Estructura Base - Stadium */}
                        <ellipse cx="50" cy="75" rx="45" ry="22" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.9" />
                        <ellipse cx="50" cy="65" rx="45" ry="22" fill="none" stroke="#fff" strokeWidth="1" opacity="0.6" className="scan-line" />
                        {/* Muros Perimetrales */}
                        <path d="M5,75 L5,65 M95,75 L95,65 M50,97 L50,87 M50,53 L50,43" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.4" />
                        {/* Interior / Techo */}
                        <ellipse cx="50" cy="65" rx="25" ry="12" fill="none" stroke="#fff" strokeWidth="0.8" opacity="0.5" />
                    </g>
                );
            case 'arena':
                return (
                    <g transform="translate(10, 10) scale(0.8)" style={glowStyle}>
                        {/* Hexágono Volumétrico - Arena */}
                        <path d="M50,20 L90,40 L90,80 L50,100 L10,80 L10,40 Z" fill="none" stroke="#fff" strokeWidth="2" opacity="0.9" />
                        <path d="M50,40 L90,60 L90,100 L50,120 L10,100 L10,60 Z" fill="none" stroke="#fff" strokeWidth="1" opacity="0.3" transform="translate(0, -15)" />
                        {/* Aristas de Profundidad */}
                        <path d="M10,40 L10,25 M90,40 L90,25 M50,20 L50,5 M50,100 L50,85" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
                        <path d="M50,20 L50,100 M10,40 L90,80 M10,80 L90,40" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.1" />
                    </g>
                );
            default: // theater
                return (
                    <g transform="translate(10, 10) scale(0.8)" style={glowStyle}>
                        {/* Bloque Táctico - Teatro */}
                        <path d="M20,40 L60,20 L90,35 L90,85 L50,100 L15,85 Z" fill="none" stroke="#fff" strokeWidth="2" opacity="0.9" />
                        <path d="M20,40 L50,55 L90,35 M50,55 L50,100" fill="none" stroke="#fff" strokeWidth="1" opacity="0.6" />
                        <path d="M20,30 L60,10 L90,25" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.8" className="scan-line" />
                        <rect x="35" y="65" width="30" height="20" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.3" transform="skewY(-15)" />
                    </g>
                );
        }
    };

    return (
        <svg viewBox="0 0 100 100" style={{ width: '90%', height: '90%', overflow: 'visible' }}>
            {/* Rejilla de base de alta intensidad */}
            <path d="M0,75 L50,100 L100,75" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
            <path d="M50,50 L50,100" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" fill="none" />
            {renderModel()}
        </svg>
    );
};

const SpectrumAnalyzer = () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '30px', padding: '10px', position: 'absolute', bottom: 0, right: 0, zIndex: 2 }}>
        {[...Array(12)].map((_, i) => (
            <div key={i} className="bar" style={{ 
                width: '3px', 
                background: '#fff', 
                animation: `pulse-bar ${0.5 + Math.random()}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.05}s`,
                boxShadow: '0 0 10px rgba(255,255,255,0.5)'
            }}></div>
        ))}
    </div>
);

const VenueCard = ({ venue, onEdit, onDelete }) => {
    const navigate = useNavigate();

    return (
        <Card className="venue-tactical-card industrial-node" style={{ padding: 0, overflow: 'hidden', height: '100%', position: 'relative', background: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0px' }}>
            {/* Cabecera Técnica - Máximo Contraste */}
            <div style={{ padding: '16px', background: '#0a0a0a', borderBottom: '2px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: '#fff', lineHeight: '1.2', textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>{venue.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                        <Icon name="map-pin" size={12} style={{ color: 'var(--primary-color)' }} />
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>{venue.city}</span>
                    </div>
                </div>
                <Badge variant={venue.status === 'active' ? 'success' : 'danger'} rounded style={{ fontSize: '10px', fontWeight: 900, padding: '5px 12px', letterSpacing: '1px', boxShadow: venue.status === 'active' ? '0 0 15px rgba(0,255,100,0.3)' : 'none' }}>
                    {venue.status === 'active' ? '● ONLINE' : '○ OFFLINE'}
                </Badge>
            </div>

            {/* Visualizador de Infraestructura (Holograma Isométrico 3D) */}
            <div style={{ height: '180px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {/* Rejilla de fondo táctica */}
                <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }}></div>
                
                <div className="venue-map-preview-bg" style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IsometricBuilding type={venue.type || 'theater'} />
                </div>

                {/* HEARTBEAT (Analizador de sonido) */}
                <SpectrumAnalyzer />
                
                <div style={{ zIndex: 1, position: 'absolute', top: '10px', left: '10px' }}>
                    <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '1px' }}>MODEL_TYPE: {venue.type?.toUpperCase() || 'GENERIC'}</div>
                </div>
                
                {/* Overlay Táctico */}
                <div className="venue-card-overlay">
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '20px', fontSize: '11px', fontWeight: 900, color: '#fff', letterSpacing: '3px', textShadow: '0 0 10px var(--primary-glow)' }}>ACCESS_NODE_{venue.id}</div>
                        <div style={{ display: 'flex', gap: '25px' }}>
                            <div className="overlay-action">
                                <button className="tactical-btn high-vis edit-btn" onClick={() => navigate('/admin/venue-map')}>
                                    <Icon name="edit-3" size={24} />
                                </button>
                                <span>EDITOR</span>
                            </div>
                            <div className="overlay-action">
                                <button className="tactical-btn high-vis radar-btn" onClick={() => navigate('/admin/seat-monitor')}>
                                    <Icon name="activity" size={24} />
                                </button>
                                <span>RADAR</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Técnica + Botones Sólidos */}
            <div style={{ padding: '22px', background: '#080808' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                    <div className="technical-stat">
                        <label>CAPACIDAD TOTAL</label>
                        <div className="val-box">
                            <Icon name="users" size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
                            <span>{venue.capacity?.toLocaleString() || '0'} PAX</span>
                        </div>
                    </div>
                    <div className="technical-stat">
                        <label>FLUJO DE TRÁFICO</label>
                        <div className="val-box">
                            <Icon name="bar-chart-2" size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
                            <span>3 ACTIVOS</span>
                        </div>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button 
                        size="small" 
                        variant="ghost" 
                        className="industrial-btn-primary"
                        style={{ 
                            flex: 1, 
                            fontSize: '11px', 
                            fontWeight: 900, 
                            letterSpacing: '1.5px', 
                            background: '#1a1a1a',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#fff',
                            height: '40px'
                        }}
                        onClick={() => onEdit(venue)}
                    >
                         SISTEMA // CONFIG
                    </Button>
                    <Button 
                        size="small" 
                        variant="danger" 
                        style={{ width: '45px', background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => onDelete(venue)}
                    >
                        <Icon name="trash-2" size={18} style={{ color: '#ff3b3b' }} />
                    </Button>
                </div>
            </div>

            <style>{`
                @keyframes pulse-bar {
                    0% { height: 5px; }
                    100% { height: 25px; }
                }
                .venue-tactical-card {
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: default;
                }
                .venue-tactical-card:hover {
                    border-color: var(--primary-color) !important;
                    box-shadow: 0 0 50px rgba(0,0,0,0.9), inset 0 0 20px rgba(var(--primary-rgb), 0.05);
                    transform: translateY(-8px);
                }
                .venue-card-overlay {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.92);
                    backdrop-filter: blur(12px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: all 0.4s ease;
                    z-index: 10;
                }
                .venue-tactical-card:hover .venue-card-overlay {
                    opacity: 1;
                }
                .overlay-action {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }
                .overlay-action span {
                    font-size: 10px;
                    font-weight: 900;
                    color: #fff;
                    letter-spacing: 2px;
                }
                .tactical-btn.high-vis {
                    background: rgba(255,255,255,0.05);
                    border: 2px solid rgba(255,255,255,0.4);
                    color: #fff;
                    width: 65px;
                    height: 65px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .tactical-btn.high-vis:hover {
                    background: #fff;
                    color: #000;
                    border-color: #fff;
                    transform: scale(1.15);
                    box-shadow: 0 0 30px #fff;
                }
                .technical-stat label {
                    display: block;
                    font-size: 9px;
                    color: rgba(255,255,255,0.4);
                    font-weight: 900;
                    letter-spacing: 1.5px;
                    margin-bottom: 8px;
                }
                .val-box {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .val-box span {
                    font-size: 15px;
                    font-weight: 900;
                    color: #fff;
                    font-family: 'Space Mono', monospace;
                    text-shadow: 0 0 5px rgba(255,255,255,0.2);
                }
                .scan-line {
                    animation: scan 3s linear infinite;
                }
                @keyframes scan {
                    0% { stroke-dashoffset: 40; }
                    100% { stroke-dashoffset: 0; }
                }
            `}</style>
        </Card>
    );
};

export default VenueCard;
