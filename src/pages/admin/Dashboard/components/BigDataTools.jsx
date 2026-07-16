import React from 'react';
import { Settings, ChevronDown, Palette, Eye, Database as DatabaseIcon } from 'lucide-react';
import { Card } from '../../../../components';

const BigDataTools = ({
    openColorPanel,
    setOpenColorPanel,
    colorPalette,
    setColorPalette,
    palettes,
    openMetricsPanel,
    setOpenMetricsPanel,
    hMult, setHMult,
    barWidth, setBarWidth,
    markerSize, setMarkerSize,
    customColor, setCustomColor,
    opacity, setOpacity,
    buildingShape, setBuildingShape,
    isWireframe, setIsWireframe,
    openLogPanel, setOpenLogPanel,
    canonicalData
}) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Esquema de Color */}
            <Card style={{ 
                padding: openColorPanel ? '1.5rem' : '1rem 1.2rem', 
                background: 'var(--bg-card, #ffffff)', 
                border: '1px solid var(--border-color, #e2e8f0)', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)', 
                borderRadius: '16px', 
                transition: 'all 0.3s ease',
                overflow: 'hidden'
            }}>
                <button 
                    onClick={() => setOpenColorPanel(v => !v)} 
                    style={{ 
                        width: '100%', 
                        background: 'transparent', 
                        border: 'none', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: 0, 
                        cursor: 'pointer',
                        marginBottom: openColorPanel ? '1rem' : '0'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: '#f1f5f9', padding: '6px', borderRadius: '8px', color: '#0f172a' }}>
                            <Palette size={16} />
                        </div>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '0.5px' }}>ESQUEMA DE COLOR</h3>
                    </div>
                    <ChevronDown size={18} color="#64748b" style={{ transform: openColorPanel ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
                </button>
                
                {openColorPanel && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {Object.keys(palettes).map(p => (
                            <button 
                                key={p} 
                                onClick={() => setColorPalette(p)} 
                                style={{
                                    background: colorPalette === p ? '#111827' : '#f8fafc',
                                    color: colorPalette === p ? '#ffffff' : '#475569',
                                    border: colorPalette === p ? '1px solid #111827' : '1px solid #e2e8f0',
                                    padding: '0.8rem 0.5rem',
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}
            </Card>

            {/* Configuración 3D */}
            <Card style={{ 
                padding: openMetricsPanel ? '1.5rem' : '1rem 1.2rem', 
                background: 'var(--bg-card, #ffffff)', 
                border: '1px solid var(--border-color, #e2e8f0)', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)', 
                borderRadius: '16px', 
                transition: 'all 0.3s ease',
                overflow: 'hidden'
            }}>
                <button 
                    onClick={() => setOpenMetricsPanel(v => !v)} 
                    style={{ 
                        width: '100%', 
                        background: 'transparent', 
                        border: 'none', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: 0, 
                        cursor: 'pointer',
                        marginBottom: openMetricsPanel ? '1.5rem' : '0'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: '#f1f5f9', padding: '6px', borderRadius: '8px', color: '#0f172a' }}>
                            <Settings size={16} />
                        </div>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '0.5px' }}>CONFIGURACIÓN 3D</h3>
                    </div>
                    <ChevronDown size={18} color="#64748b" style={{ transform: openMetricsPanel ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
                </button>
                
                {openMetricsPanel && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div className="slider-group">
                            <div className="slider-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Altura (Z)</label>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#111827', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>{hMult}x</span>
                            </div>
                            <input type="range" min="0.5" max="5" step="0.1" value={hMult} onChange={(e) => setHMult(parseFloat(e.target.value))} className="slider-premium" />
                        </div>
                        
                        <div className="slider-group">
                            <div className="slider-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Ancho Base</label>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#111827', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>{barWidth}</span>
                            </div>
                            <input type="range" min="0.05" max="0.5" step="0.01" value={barWidth} onChange={(e) => setBarWidth(parseFloat(e.target.value))} className="slider-premium" />
                        </div>
                        
                        <div className="slider-group">
                            <div className="slider-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Tamaño Puntos</label>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#111827', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>{markerSize}px</span>
                            </div>
                            <input type="range" min="4" max="24" step="1" value={markerSize} onChange={(e) => setMarkerSize(parseInt(e.target.value))} className="slider-premium" />
                        </div>
                        
                        <div className="slider-group">
                            <div className="slider-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Opacidad</label>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#111827', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>{Math.round(opacity * 100)}%</span>
                            </div>
                            <input type="range" min="0.1" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="slider-premium" />
                        </div>
                        
                        <div className="slider-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Color Custom</label>
                            <input type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} style={{ padding: 0, border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', marginTop: '0.5rem' }}>
                            <select 
                                className="select-premium" 
                                value={buildingShape} 
                                onChange={(e) => setBuildingShape(e.target.value)}
                                style={{ padding: '0.6rem', fontSize: '0.75rem' }}
                            >
                                <option value="cube">Cubos</option>
                                <option value="pyramid">Pirámides</option>
                                <option value="points">Puntos</option>
                            </select>
                            <button 
                                onClick={() => setIsWireframe(!isWireframe)} 
                                style={{
                                    background: isWireframe ? '#111827' : '#f8fafc',
                                    color: isWireframe ? '#ffffff' : '#475569',
                                    border: isWireframe ? '1px solid #111827' : '1px solid #e2e8f0',
                                    padding: '0.6rem',
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Eye size={14}/> {isWireframe ? 'Boceto' : 'Sólido'}
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Log de Tectónico */}
            <Card style={{ 
                padding: openLogPanel ? '0' : '1rem 1.2rem', 
                background: 'var(--bg-card, #ffffff)', 
                border: '1px solid var(--border-color, #e2e8f0)', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)', 
                borderRadius: '16px', 
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                flexGrow: 0
            }}>
                <button 
                    onClick={() => setOpenLogPanel(v => !v)} 
                    style={{ 
                        width: '100%', 
                        background: 'transparent', 
                        border: openLogPanel ? 'none' : 'none', 
                        borderBottom: openLogPanel ? '1px solid #e2e8f0' : 'none',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: openLogPanel ? '1rem 1.5rem' : '0', 
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: '#f1f5f9', padding: '6px', borderRadius: '8px', color: '#0f172a' }}>
                            <DatabaseIcon size={16} />
                        </div>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '0.5px' }}>LOG DE EVENTOS</h3>
                    </div>
                    <ChevronDown size={18} color="#64748b" style={{ transform: openLogPanel ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
                </button>
                
                {openLogPanel && (
                    <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '0.5rem 1rem' }}>
                        {canonicalData.slice(0, 20).map((d, i) => (
                            <div key={i} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                padding: '0.8rem 0.5rem', 
                                borderBottom: '1px solid #f1f5f9',
                                transition: 'background 0.2s',
                                borderRadius: '8px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', width: '24px' }}>{(i+1).toString().padStart(2, '0')}</span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '10px' }}>{d.producto}</span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>${d.val_num.toLocaleString()}</span>
                            </div>
                        ))}
                        {canonicalData.length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>Sin datos coincidentes</div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default BigDataTools;
