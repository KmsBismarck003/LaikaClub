import React, { useState } from 'react';
import { Database, Download, Activity, ExternalLink, Globe, Image as ImageIcon, Code, CheckCircle2 } from 'lucide-react';

const ScrapingHubDisplay = ({ mlData, mlLoading, executeMLAnalysis, executeCustomScraping }) => {
    const [customUrl, setCustomUrl] = useState('');

    const handleCustomScrape = () => {
        if (customUrl) executeCustomScraping(customUrl);
    };

    const isCustomData = mlData && mlData.metadata && mlData.assets;

    return (
        <div className="ml-panel-content" style={{ maxHeight: '520px', overflowY: 'auto', paddingRight: '10px' }}>
            {/* Header & Mode Selector */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <Database size={20} color="#000" /> CENTRO DE EXTRACCIÓN
                    </h2>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        MODO: <span style={{ color: '#000', fontWeight: 700, background: '#e2e8f0', padding: '1px 8px', borderRadius: '10px' }}>ESTÁNDAR + DINÁMICO</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={() => executeMLAnalysis('SCRAPING_HUB')}
                        className="btn-primary"
                        disabled={mlLoading}
                        style={{ padding: '8px 16px', fontSize: '0.7rem', borderRadius: '20px' }}
                    >
                        <Download size={14} /> DB FÚTBOL
                    </button>
                </div>
            </div>

            {/* Custom URL Input Section */}
            <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Extractor Dinámico de Activos (SVGs/Imágenes)</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Globe size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="https://ejemplo.com"
                            value={customUrl}
                            onChange={(e) => setCustomUrl(e.target.value)}
                            style={{ 
                                width: '100%', padding: '10px 15px 10px 35px', borderRadius: '20px', 
                                border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none',
                                background: '#fff'
                            }}
                        />
                    </div>
                    <button 
                        onClick={handleCustomScrape}
                        disabled={mlLoading || !customUrl}
                        style={{ 
                            background: '#000', color: '#fff', border: 'none', borderRadius: '20px', 
                            padding: '0 20px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px', opacity: (mlLoading || !customUrl) ? 0.5 : 1
                        }}
                    >
                        {mlLoading ? 'EXTRAYENDO...' : 'EXTRAER URL'}
                    </button>
                </div>
            </div>

            {!mlData ? (
                <div style={{ 
                    background: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: '25px', 
                    height: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', 
                    justifyContent: 'center', color: '#94a3b8', gap: '10px' 
                }}>
                    <Activity size={32} opacity={0.3} />
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Esperando Disparo de Extracción...</div>
                </div>
            ) : isCustomData ? (
                /* CUSTOM DATA VIEW */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '25px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                            <CheckCircle2 size={18} color="#10b981" />
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>{mlData.metadata.title}</h3>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                            {mlData.metadata.description}
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            <div style={{ background: '#f1f5f9', padding: '10px 15px', borderRadius: '15px' }}>
                                <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 800 }}>IMÁGENES</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{mlData.assets.images.length}</div>
                            </div>
                            <div style={{ background: '#f1f5f9', padding: '10px 15px', borderRadius: '15px' }}>
                                <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 800 }}>SVGs DETECTADOS</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{mlData.assets.svgs_inline_count}</div>
                            </div>
                        </div>
                    </div>

                    {/* GALERÍA DE ACTIVOS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <ImageIcon size={12} style={{ marginRight: '5px' }} /> Galería de Recursos
                        </div>
                        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                            {mlData.assets.images.map((img, idx) => (
                                <div key={idx} style={{ flex: '0 0 100px', height: '100px', background: '#f1f5f9', borderRadius: '15px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                    <img src={img} alt={`asset-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SVG SNIPPET (If available) */}
                    {mlData.assets.sample_svg && (
                        <div style={{ background: '#000', padding: '1.5rem', borderRadius: '25px', color: '#fff' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Code size={14} /> CAPTURA SVG BRUTA
                            </div>
                            <div 
                                style={{ width: '60px', height: '60px', background: '#fff', borderRadius: '10px', padding: '5px', marginBottom: '15px' }}
                                dangerouslySetInnerHTML={{ __html: mlData.assets.sample_svg }}
                            />
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {mlData.assets.sample_svg.substring(0, 100)}...
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* FOOTBALL DATA VIEW */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '1px' }}>Tendencia de Goles (Últimos 10 Partidos)</div>
                        <svg width="100%" height="160" viewBox="0 0 600 160">
                            {[0, 1, 2, 3].map(i => (
                                <line key={i} x1="0" y1={160 - (i * 40)} x2="600" y2={160 - (i * 40)} stroke="#f1f5f9" strokeWidth="1" />
                            ))}
                            {(mlData?.data || []).slice(-12).map((match, idx) => {
                                const hg = match.goles_local * 15;
                                const ag = match.goles_visitante * 15;
                                const x = 40 + (idx * 45);
                                return (
                                    <g key={idx}>
                                        <rect x={x} y={160 - hg} width="12" height={hg} fill="#000" rx="20" />
                                        <rect x={x + 15} y={160 - ag} width="12" height={ag} fill="#94a3b8" rx="20" />
                                        <text x={x + 7} y={175} fontSize="8" fontWeight="700" fill="#cbd5e1" textAnchor="middle">
                                            {match.local.substring(0, 3)}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>

                    <div style={{ borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <tr>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700 }}>FECHA</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700 }}>PARTIDO</th>
                                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 700 }}>MARCADOR</th>
                                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 700 }}>RESULTADO</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(mlData?.data || []).slice().reverse().map((m, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '0.7rem' }}>{m.fecha}</td>
                                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                                            <span style={{ color: '#000' }}>{m.local}</span> vs <span style={{ color: '#64748b' }}>{m.visitante}</span>
                                        </td>
                                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                            <span style={{ background: '#000', color: '#fff', padding: '4px 12px', borderRadius: '25px', fontWeight: 800, fontSize: '0.7rem' }}>
                                                {m.goles_local} - {m.goles_visitante}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                            <span style={{ 
                                                fontWeight: 800, 
                                                color: m.resultado === 'H' ? '#10b981' : m.resultado === 'A' ? '#ef4444' : '#94a3b8',
                                                background: m.resultado === 'H' ? '#d1fae5' : m.resultado === 'A' ? '#fee2e2' : '#f1f5f9',
                                                padding: '2px 8px',
                                                borderRadius: '20px',
                                                fontSize: '0.65rem'
                                            }}>
                                                {m.resultado}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScrapingHubDisplay;
