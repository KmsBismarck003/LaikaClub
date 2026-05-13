import React, { useState } from 'react';
import { 
    Filter, Palette, BarChart2, ScatterChart, PieChart, Pyramid, 
    Layers, Grid, CreditCard, Banknote, Coins, Sun, Sunrise, Moon, CloudMoon,
    ChevronRight, ChevronDown, ChevronUp, Download, RefreshCw
} from 'lucide-react';
import Card from '../../../../components/Card/Card';

const FilterSidebar = ({ 
    filters, 
    handleFilterChange, 
    chartType, 
    setChartType, 
    colorMode, 
    setColorMode, 
    executeAnalysis, 
    handleExportExcel,
    colorPalette,
    setColorPalette,
    currentPalettes,
    analysisMode,
    selectedTable,
    setSelectedTable
}) => {
    const DATA_SOURCES = [
        { id: 'payments_by_hour', label: 'Ventas por Hora' },
        { id: 'merchandise', label: 'Mix de Prod (Ingresos)' },
        { id: 'top_spenders', label: 'Lealtad: Top VIP' },
        { id: 'events', label: 'Rentabilidad Eventos' },
        { id: 'conversion', label: 'Embudo Conversión' }
    ];

    // Helper para disparar cambio de filtro simulando evento target
    const triggerChange = (name, value) => {
        handleFilterChange({ target: { name, value } });
    };

    const [isModulesOpen, setIsModulesOpen] = useState(false);
    const [isControlHubOpen, setIsControlHubOpen] = useState(false);
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);

    return (
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* Navegación de Módulos (Acordeón) */}
            <Card className="glass-card" style={{ padding: '1.2rem', borderRadius: '20px' }}>
                <div 
                    onClick={() => setIsModulesOpen(!isModulesOpen)}
                    style={{ 
                        marginBottom: isModulesOpen ? '1rem' : '0', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        gap: '8px',
                        cursor: 'pointer',
                        userSelect: 'none'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '3px', height: '14px', background: '#000' }}></div>
                        <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: '#000', margin: 0, letterSpacing: '0.05em' }}>MÓDULOS</h3>
                    </div>
                    {isModulesOpen ? <ChevronUp size={14} color="#64748b" /> : <ChevronDown size={14} color="#64748b" />}
                </div>
                
                {isModulesOpen && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', animation: 'slideDown 0.3s ease-out' }}>
                        {DATA_SOURCES.map(source => (
                            <button
                                key={source.id}
                                onClick={() => setSelectedTable(source.id)}
                                className={`sidebar-nav-btn ${selectedTable === source.id ? 'active' : ''}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                    padding: '10px 14px',
                                    border: 'none',
                                    background: selectedTable === source.id ? '#000' : 'transparent',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: selectedTable === source.id ? 800 : 500,
                                    color: selectedTable === source.id ? '#fff' : '#64748b',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                            >
                                {source.label}
                                {selectedTable === source.id && <ChevronRight size={14} />}
                            </button>
                        ))}
                    </div>
                )}
            </Card>

            <Card className="glass-card" style={{ padding: '1.2rem', borderRadius: '20px' }}>
                <div 
                    onClick={() => setIsControlHubOpen(!isControlHubOpen)}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        marginBottom: isControlHubOpen ? '1.2rem' : '0',
                        cursor: 'pointer',
                        userSelect: 'none'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Filter size={16} color="#000" />
                        <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#000', margin: 0 }}>CONTROL HUB</h3>
                    </div>
                    {isControlHubOpen ? <ChevronUp size={14} color="#64748b" /> : <ChevronDown size={14} color="#64748b" />}
                </div>
                
                {isControlHubOpen && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'slideDown 0.3s ease-out' }}>
                        
                        {/* --- CONFIGURACIÓN DE VISTA --- */}
                        {analysisMode === '2D_EXPLORATION' && (
                            <div className="filter-group">
                                <label>MODO DE VISUALIZACIÓN</label>
                                <div className="segmented-group">
                                    <button className={`segmented-btn ${chartType === '2D_BAR' ? 'active' : ''}`} onClick={() => setChartType('2D_BAR')}>
                                        <BarChart2 size={14} /> BAR
                                    </button>
                                    <button className={`segmented-btn ${chartType === '2D_SCATTER' ? 'active' : ''}`} onClick={() => setChartType('2D_SCATTER')}>
                                        <ScatterChart size={14} /> SCAT
                                    </button>
                                    <button className={`segmented-btn ${chartType === '2D_PIE' ? 'active' : ''}`} onClick={() => setChartType('2D_PIE')}>
                                        <PieChart size={14} /> PIE
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="filter-group">
                            <label>LÍMITE (TOP N)</label>
                            <div className="segmented-group">
                                {['10', '20', '50', '100'].map(val => (
                                    <button 
                                        key={val} 
                                        className={`segmented-btn ${filters.limit === val ? 'active' : ''}`} 
                                        onClick={() => triggerChange('limit', val)}
                                        style={{ flex: 1 }}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* --- FILTROS TEMPORALES --- */}
                        <div className="filter-group">
                            <label>RANGO DE FECHAS</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                                <input type="date" name="date_from" value={filters.date_from} onChange={handleFilterChange} className="input-premium" style={{fontSize: '0.7rem', padding: '6px 8px'}} />
                                <input type="date" name="date_to" value={filters.date_to} onChange={handleFilterChange} className="input-premium" style={{fontSize: '0.7rem', padding: '6px 8px'}} />
                            </div>
                        </div>

                        {/* --- FILTROS DINÁMICOS POR MÓDULO --- */}
                        {selectedTable === 'payments_by_hour' && (
                            <>
                                <div className="filter-group">
                                    <label>MÉTODO DE PAGO</label>
                                    <div className="filter-chip-group">
                                        <button className={`filter-chip ${filters.payment_method === '' ? 'active' : ''}`} onClick={() => triggerChange('payment_method', '')}>TODO</button>
                                        <button className={`filter-chip ${filters.payment_method === 'Card' ? 'active' : ''}`} onClick={() => triggerChange('payment_method', 'Card')}>
                                            <CreditCard size={14} /> CARD
                                        </button>
                                        <button className={`filter-chip ${filters.payment_method === 'Cash' ? 'active' : ''}`} onClick={() => triggerChange('payment_method', 'Cash')}>
                                            <Banknote size={14} /> CASH
                                        </button>
                                        <button className={`filter-chip ${filters.payment_method === 'Credits' ? 'active' : ''}`} onClick={() => triggerChange('payment_method', 'Credits')}>
                                            <Coins size={14} /> CRED
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="filter-group">
                                    <label>SEGMENTO HORARIO</label>
                                    <div className="filter-chip-group">
                                        <button className={`filter-chip ${filters.hour_range === '' ? 'active' : ''}`} onClick={() => triggerChange('hour_range', '')}>TODO</button>
                                        <button className={`filter-chip ${filters.hour_range === 'morning' ? 'active' : ''}`} onClick={() => triggerChange('hour_range', 'morning')} title="Mañana"><Sunrise size={14} /></button>
                                        <button className={`filter-chip ${filters.hour_range === 'afternoon' ? 'active' : ''}`} onClick={() => triggerChange('hour_range', 'afternoon')} title="Tarde"><Sun size={14} /></button>
                                        <button className={`filter-chip ${filters.hour_range === 'night' ? 'active' : ''}`} onClick={() => triggerChange('hour_range', 'night')} title="Noche"><CloudMoon size={14} /></button>
                                        <button className={`filter-chip ${filters.hour_range === 'late_night' ? 'active' : ''}`} onClick={() => triggerChange('hour_range', 'late_night')} title="Madrugada"><Moon size={14} /></button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* --- ACCIONES FINALES --- */}
                        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button onClick={executeAnalysis} className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: '#000' }}>
                                <RefreshCw size={14} /> ACTUALIZAR DATOS
                            </button>
                            <button onClick={handleExportExcel} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', borderRadius: '12px' }}>
                                <Download size={14} /> REPORTE CSV
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Selector de Esquema de Color (Solo en 2D) */}
            {analysisMode === '2D_EXPLORATION' && (
                <Card style={{ padding: '1.2rem', borderRadius: '20px', background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <div 
                        onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            marginBottom: isPaletteOpen ? '1rem' : '0',
                            cursor: 'pointer',
                            userSelect: 'none'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Palette size={16} color="#000" />
                            <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#000', margin: 0, opacity: 0.8 }}>COLOR PALETTE</h3>
                        </div>
                        {isPaletteOpen ? <ChevronUp size={14} color="#64748b" /> : <ChevronDown size={14} color="#64748b" />}
                    </div>

                    {isPaletteOpen && (
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '6px', 
                            animation: 'slideDown 0.2s ease-out',
                            maxHeight: '180px',
                            overflowY: 'auto',
                            paddingRight: '4px',
                            msOverflowStyle: 'none',
                            scrollbarWidth: 'thin'
                        }}>
                            {Object.keys(currentPalettes).map(p => (
                                <button 
                                    key={p} 
                                    onClick={() => setColorPalette(p)} 
                                    style={{
                                        background: colorPalette === p ? '#f8fafc' : 'transparent',
                                        border: colorPalette === p ? '1px solid #000' : '1px solid #e2e8f0',
                                        borderRadius: '10px', 
                                        padding: '8px 12px', 
                                        color: '#000', 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center', 
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <span style={{ fontSize: '0.6rem', fontWeight: 800 }}>{p.replace('_', ' ').toUpperCase()}</span>
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                        {currentPalettes[p].slice(0, 4).map((c, i) => (
                                            <div key={i} style={{ width: '8px', height: '8px', borderRadius: '2px', background: c[1] }}></div>
                                        ))}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                </Card>
            )}
        </aside>
    );
};

export default FilterSidebar;
