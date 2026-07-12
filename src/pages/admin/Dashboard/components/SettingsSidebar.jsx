import React, { useState } from 'react';
import { Settings, Database as DatabaseIcon, Eye, ChevronDown, ChevronUp, Check, Terminal } from 'lucide-react';
import Card from '../../../../components/Card/Card';

const SettingsSidebar = ({ 
    hMult, setHMult, 
    barWidth, setBarWidth, 
    markerSize, setMarkerSize, 
    customColor, setCustomColor, 
    opacity, setOpacity, 
    buildingShape, setBuildingShape, 
    isWireframe, setIsWireframe,
    canonicalData,
    mlData,
    analysisMode,
    selectedTable
}) => {
    const [isLogOpen, setIsLogOpen] = useState(false);

    // Lógica para determinar qué mostrar en el log según el modo
    const getLogContent = () => {
        if (analysisMode === 'ML_PCA' && mlData?.data && Array.isArray(mlData.data)) {
            return mlData.data.slice(0, 20).map((d, i) => (
                <div key={i} className="log-row-premium">
                    <span className="log-rank" style={{ color: '#000', fontWeight: 900 }}>C{d.cluster}</span>
                    <span className="log-name" title={d.metrics?.producto || 'Registro'}>
                        {d.metrics?.producto || 'ID: ' + i}
                    </span>
                    <span className="log-val" style={{ fontSize: '0.6rem', opacity: 0.7 }}>Mapa PCA</span>
                </div>
            ));
        }

        if ((analysisMode === 'ML_REGRESSION' || analysisMode === 'ML_DECISION_TREE') && mlData?.data && Array.isArray(mlData.data)) {
            return mlData.data.slice(0, 20).map((d, i) => (
                <div key={i} className="log-row-premium">
                    <span className="log-rank">{(i+1).toString().padStart(2, '0')}</span>
                    <span className="log-name" title={d.producto || 'Dato'}>{d.producto || 'Reg.' + i}</span>
                    <span className="log-val" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>${Math.round(d.y_pred || 0).toLocaleString()}</span>
                        <span style={{ fontSize: '0.55rem', opacity: 0.5 }}>Real: ${Math.round(d.y || 0).toLocaleString()}</span>
                    </span>
                </div>
            ));
        }

        // Default: Exploration 2D or Fallback
        const displayData = canonicalData || [];
        return displayData.slice(0, 20).map((d, i) => (
            <div key={i} className="log-row-premium">
                <span className="log-rank">{(i+1).toString().padStart(2, '0')}</span>
                <span className="log-name" title={d.producto}>{d.producto}</span>
                <span className="log-val">${d.val_num.toLocaleString()}</span>
            </div>
        ));
    };

    return (
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>


            <Card style={{ 
                padding: '0', 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '24px', 
                display: 'flex', 
                flexDirection: 'column', 
                flexGrow: isLogOpen ? 1 : 0, 
                overflow: 'hidden', 
                boxShadow: '0 8px 32px rgba(0,0,0,0.04)' 
            }}>
                <div 
                    onClick={() => setIsLogOpen(!isLogOpen)}
                    style={{ 
                        padding: '1.2rem', 
                        borderBottom: isLogOpen ? '1px solid rgba(0,0,0,0.04)' : 'none', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        background: 'var(--bg-primary)',
                        cursor: 'pointer',
                        userSelect: 'none'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <DatabaseIcon size={14} color="#000" />
                        <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                            {analysisMode === '2D_EXPLORATION' ? 'LOG DE ACTIVIDAD' : 'LOG DE RESULTADOS PROCESADOS'}
                        </h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {analysisMode !== '2D_EXPLORATION' && isLogOpen && (
                            <span style={{ fontSize: '0.6rem', color: '#fff', background: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>MODO IA</span>
                        )}
                        {isLogOpen ? <ChevronUp size={14} color="#64748b" /> : <ChevronDown size={14} color="#64748b" />}
                    </div>
                </div>
                
                {isLogOpen && (
                    <div className="log-container-premium" style={{ animation: 'slideDown 0.3s ease-out' }}>
                        {getLogContent()}
                        {((analysisMode === '2D_EXPLORATION' && canonicalData.length === 0) || 
                          (analysisMode !== '2D_EXPLORATION' && !mlData)) && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>Sin datos coincidentes</div>
                        )}
                    </div>
                )}
            </Card>

            {/* MÉTRICAS REUBICADAS (Debajo del Log) */}
            <Card style={{ 
                padding: '1.2rem', 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '24px', 
                position: 'relative', 
                overflow: 'hidden', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                transition: 'all 0.5s ease'
            }}>
                <div style={{ 
                    position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', 
                    background: '#000',
                    transition: 'background 0.5s ease'
                }}></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        INTELIGENCIA DE DATOS
                    </div>
                </div>

                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    { analysisMode === 'ML_DECISION_TREE' ? 'Hallazgo: Árbol Decisión' :
                      analysisMode === 'ML_REGRESSION' ? 'Hallazgo: Proyección' :
                      analysisMode === 'ML_NEURAL_NETWORK' ? 'Hallazgo: Red Neuronal' :
                      analysisMode === 'ML_PCA' ? 'Hallazgo: Segmentación' :
                      'Mapeo de Solidez' }
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', opacity: 0.7, lineHeight: '1.4', marginBottom: '1rem' }}>
                    { (analysisMode !== '2D_EXPLORATION' && mlData?.insights?.length > 0) 
                        ? <b>{mlData.insights[0]}</b>
                        : `Análisis de ${selectedTable}.`
                    }
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-primary)', background: '#f1f5f9', padding: '6px 12px', borderRadius: '12px', width: 'fit-content' }}>
                    <DatabaseIcon size={10} color="#000000" /> {canonicalData.length} Registros
                </div>
            </Card>

            <Card style={{ 
                padding: '1.2rem', 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-color)', 
                color: 'var(--text-primary)', 
                borderRadius: '24px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-primary)', opacity: 0.8, marginBottom: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    INGRESO TOTAL
                </div>
                
                <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '0.6rem', color: '#000', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    ${canonicalData.reduce((acc, d) => acc + d.val_num, 0).toLocaleString()} 
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>MXN</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '0.8rem' }}>
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                        Pico: <strong style={{ color: '#000' }}>{canonicalData[0]?.producto?.substring(0, 10) || '---'}</strong>
                    </div>
                    <div style={{ 
                        background: (analysisMode !== '2D_EXPLORATION') ? 'rgba(0, 0, 0, 0.05)' : 'rgba(16, 185, 129, 0.1)', 
                        color: (analysisMode !== '2D_EXPLORATION') ? '#000' : '#10b981', 
                        padding: '2px 6px', 
                        borderRadius: '6px', 
                        fontSize: '0.55rem', 
                        fontWeight: 800, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '3px'
                    }}>
                        { (analysisMode !== '2D_EXPLORATION') ? <Terminal size={8}/> : <Check size={8}/> }
                        { (analysisMode !== '2D_EXPLORATION') ? 'IA' : 'OK' }
                    </div>
                </div>
            </Card>
        </aside>
    );
};

export default SettingsSidebar;
