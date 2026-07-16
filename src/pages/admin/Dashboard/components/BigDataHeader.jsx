import React, { useState, useRef, useEffect } from 'react';
import { Database as DatabaseIcon, Zap, BookOpen, Layers, Users, Target, ShieldAlert, Activity, Terminal, Search, BarChart3, ChevronDown } from 'lucide-react';

const modes = [
    { id: '3D_EXPLORATION', label: 'VISTA EN 3D', icon: <Layers size={16} /> },
    { id: 'ML_MARKET_GAPS', label: 'HUECOS DE MERCADO', icon: <Search size={16} /> },
    { id: 'ML_RECOMMENDATIONS', label: 'RECOMENDADOR', icon: <Zap size={16} /> },
    { id: 'ML_PCA', label: 'SEGMENTACIÓN', icon: <Users size={16} /> },
    { id: 'ML_ELBOW', label: 'PERFILES IDEALES', icon: <Target size={16} /> },
    { id: 'ML_ANOMALY', label: 'ANTI-BOT', icon: <ShieldAlert size={16} /> },
    { id: 'ML_REGRESSION', label: 'PROYECCIÓN', icon: <Activity size={16} /> },
    { id: 'ML_DECISION_TREE', label: 'PRECIOS', icon: <Terminal size={16} /> },
    { id: 'CLASS_KDD', label: 'LIMPIEZA', icon: <DatabaseIcon size={16} /> },
    { id: 'B2B_PROSPECTING', label: 'EMPRESAS', icon: <Search size={16} /> },
    { id: 'ML_USER_DEMAND', label: 'CLIENTES', icon: <Users size={16} /> },
    { id: 'MERCH_INSIGHTS', label: 'MERCANCÍA', icon: <BarChart3 size={16} /> }
];

const BigDataHeader = ({
    managerId,
    analysisMode,
    setAnalysisMode,
    selectedTable,
    setSelectedTable,
    showGlossary,
    setShowGlossary,
    executeAnalysis,
    executeMLAnalysis,
    fetchDescriptiveStats
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const activeMode = modes.find(m => m.id === analysisMode) || modes[0];

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <header style={{ 
                background: 'var(--bg-card, #ffffff)', 
                border: '1px solid var(--border-color, #e2e8f0)', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)', 
                borderRadius: '16px', 
                padding: '1.2rem 1.5rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#111827', padding: '10px', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <DatabaseIcon size={20} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            ANÁLISIS Y PREDICCIONES {managerId ? 'DE MIS EVENTOS' : ''}
                            <span style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '8px', fontWeight: 700, border: '1px solid #e2e8f0' }}>v8.5_ML</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', fontWeight: 500 }}>
                            {managerId ? 'Filtrado por tus eventos' : 'Motor Distribuido: Spark ML'}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    
                    {/* CUSTOM DROPDOWN PARA MODO DE ANÁLISIS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }} ref={menuRef}>
                        <label style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Modo de Análisis</label>
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            style={{ 
                                background: '#f8fafc', 
                                border: isMenuOpen ? '1px solid #111827' : '1px solid #e2e8f0', 
                                padding: '0.5rem 1rem', 
                                borderRadius: '10px', 
                                fontSize: '0.85rem', 
                                fontWeight: 600, 
                                color: '#111827',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                cursor: 'pointer',
                                minWidth: '200px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {activeMode.icon} {activeMode.label}
                            </div>
                            <ChevronDown size={16} color="#64748b" style={{ transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                        </button>
                        
                        {isMenuOpen && (
                            <div style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                right: 0,
                                marginTop: '4px',
                                background: '#ffffff', 
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                zIndex: 50,
                                maxHeight: '300px',
                                overflowY: 'auto'
                            }}>
                                {modes.map(mode => (
                                    <button
                                        key={mode.id}
                                        onClick={() => {
                                            setAnalysisMode(mode.id);
                                            setIsMenuOpen(false);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            background: analysisMode === mode.id ? '#f1f5f9' : 'transparent',
                                            border: 'none',
                                            borderBottom: '1px solid #f8fafc',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            color: analysisMode === mode.id ? '#111827' : '#475569',
                                            cursor: 'pointer',
                                            textAlign: 'left'
                                        }}
                                        onMouseOver={(e) => { if (analysisMode !== mode.id) e.currentTarget.style.background = '#f8fafc'; }}
                                        onMouseOut={(e) => { if (analysisMode !== mode.id) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        {mode.icon} {mode.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {['3D_EXPLORATION', 'CLASS_KDD'].includes(analysisMode) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Fuente de Datos</label>
                        <select 
                            value={selectedTable} 
                            onChange={(e) => setSelectedTable(e.target.value)} 
                            style={{ 
                                background: '#f8fafc', 
                                border: '1px solid #e2e8f0', 
                                padding: '0.5rem 1rem', 
                                borderRadius: '10px', 
                                fontSize: '0.85rem', 
                                fontWeight: 600, 
                                color: '#1e293b',
                                outline: 'none',
                                cursor: 'pointer',
                                height: '37px'
                            }}
                        >
                            <option value="tickets">Tickets Principales</option>
                            <option value="users">Logs de Usuarios</option>
                            <option value="payments">Bóveda de Pagos</option>
                            <option value="events">Distribución de Eventos</option>
                        </select>
                    </div>
                    )}
                    
                    <div style={{ width: '1px', height: '40px', background: '#e2e8f0', margin: '0 0.2rem' }}></div>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', paddingBottom: '0' }}>
                        <button 
                            onClick={() => setShowGlossary(!showGlossary)} 
                            style={{ 
                                background: showGlossary ? '#e0e7ff' : '#f8fafc',
                                color: showGlossary ? '#4338ca' : '#475569',
                                border: showGlossary ? '1px solid #c7d2fe' : '1px solid #e2e8f0',
                                borderRadius: '10px',
                                padding: '0.55rem 0.8rem',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                                height: '37px'
                            }}
                        >
                            <BookOpen size={16} /> Guía
                        </button>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', paddingBottom: '0' }}>
                        <button 
                            onClick={() => {
                                if (analysisMode === '3D_EXPLORATION') executeAnalysis();
                                else if (analysisMode === 'CLASS_KDD') fetchDescriptiveStats(selectedTable);
                                else executeMLAnalysis(analysisMode);
                            }} 
                            style={{ 
                                background: '#111827', 
                                color: '#ffffff', 
                                border: 'none',
                                padding: '0.55rem 1.2rem',
                                borderRadius: '10px',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(17, 24, 39, 0.2)',
                                height: '37px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <Zap size={16} /> EJECUTAR
                        </button>
                    </div>
                </div>
            </header>
        </div>
    );
};

export default BigDataHeader;
