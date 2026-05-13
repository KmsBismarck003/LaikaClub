import React from 'react';
import { 
  Database as DatabaseIcon, 
  Layers, 
  Activity, 
  Terminal, 
  Zap 
} from 'lucide-react';

const VisualizerHeader = ({ 
    analysisMode, 
    setAnalysisMode, 
    selectedTable, 
    setSelectedTable, 
    executeAnalysis, 
    executeMLAnalysis 
}) => {
    return (
        <header className="visualizer-header-container" style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr auto 1fr', 
            alignItems: 'center', 
            marginBottom: '1.5rem',
            gap: '1rem'
        }}>
            {/* IZQUIERDA: TÍTULO E ICONO */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                    background: '#000000', 
                    padding: '12px', 
                    borderRadius: '16px', 
                    color: '#fff', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
                }}>
                    <DatabaseIcon size={24} />
                </div>
                <div>
                    <div style={{ 
                        fontWeight: 800, 
                        fontSize: '1.4rem', 
                        letterSpacing: '-0.02em', 
                        color: 'var(--text-primary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px' 
                    }}>
                        SALA DE ANÁLISIS 
                        <span style={{ 
                            fontSize: '0.65rem', 
                            background: '#e2e8f0', 
                            color: '#475569', 
                            padding: '4px 10px', 
                            borderRadius: '20px', 
                            fontWeight: 700 
                        }}>v8.5_IA</span>
                    </div>
                    <div style={{ 
                        fontSize: '0.75rem', 
                        color: 'var(--text-primary)', 
                        opacity: 0.8, 
                        marginTop: '2px', 
                        fontWeight: 500 
                    }}>
                        Motor Distribuido: Spark ML • Modo: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{analysisMode.replace('_', ' ')}</span>
                    </div>
                </div>
            </div>

            {/* CENTRO: BOTONES DE MODO */}
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', justifyContent: 'center' }}>
                {[
                    { id: '2D_EXPLORATION', label: 'EXPLORACIÓN 2D', icon: <Layers size={14} /> },
                    { id: 'ML_REGRESSION', label: 'REGRESIÓN ML', icon: <Activity size={14} /> },
                    { id: 'ML_DECISION_TREE', label: 'ÁRBOL DE DECISIÓN', icon: <Terminal size={14} /> },
                    { id: 'ML_PCA', label: 'CLUSTERING PCA', icon: <Layers size={14} /> },
                    { id: 'ML_NEURAL_NETWORK', label: 'RED NEURONAL', icon: <Zap size={14} /> },
                    { id: 'SCRAPING_HUB', label: 'CENTRO DE EXTRACCIÓN', icon: <DatabaseIcon size={14} /> }
                ].map(mode => (
                    <button 
                        key={mode.id}
                        onClick={() => setAnalysisMode(mode.id)} 
                        className={`mode-btn-premium ${analysisMode === mode.id ? 'active' : ''}`}
                    >
                        {analysisMode === mode.id && <div className="mode-indicator-dot" />}
                        {mode.icon} {mode.label}
                    </button>
                ))}
            </div>
            
            {/* DERECHA: BOTÓN DE ACCIÓN */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                    onClick={() => analysisMode === '2D_EXPLORATION' ? executeAnalysis() : executeMLAnalysis(analysisMode)} 
                    className="btn-primary"
                    style={{ height: '42px', padding: '0 1.5rem' }}
                >
                    <Zap size={14} /> EJECUTAR ANÁLISIS
                </button>
            </div>
        </header>
    );
};

export default VisualizerHeader;
