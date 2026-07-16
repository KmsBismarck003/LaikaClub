import React from 'react';
import { Filter, ChevronDown, Download } from 'lucide-react';
import { Card } from '../../../../components';

const BigDataFilters = ({
    openFiltersPanel,
    setOpenFiltersPanel,
    eventsList,
    filters,
    handleFilterChange,
    chartType,
    setChartType,
    colorMode,
    setColorMode,
    executeAnalysis,
    executeMLAnalysis,
    analysisMode,
    handleExportExcel
}) => {
    return (
        <Card style={{ 
            padding: openFiltersPanel ? '1.5rem' : '1rem 1.2rem', 
            background: 'var(--bg-card, #ffffff)', 
            border: '1px solid var(--border-color, #e2e8f0)', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)', 
            borderRadius: '16px', 
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
            overflow: 'hidden'
        }}>
            <button 
                onClick={() => setOpenFiltersPanel(v => !v)} 
                style={{ 
                    width: '100%', 
                    background: 'transparent', 
                    border: 'none', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: 0, 
                    cursor: 'pointer',
                    marginBottom: openFiltersPanel ? '1.5rem' : '0'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: '#f1f5f9', padding: '6px', borderRadius: '8px', color: '#0f172a' }}>
                        <Filter size={16} />
                    </div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '0.5px' }}>FILTROS AVANZADOS</h3>
                </div>
                <ChevronDown size={18} color="#64748b" style={{ transform: openFiltersPanel ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
            </button>
            
            {openFiltersPanel && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div className="filter-group">
                        <label>Filtrar por Evento</label>
                        <select name="event_id" value={filters.event_id} onChange={handleFilterChange} className="select-premium">
                            <option value="">Todos los eventos</option>
                            {eventsList.map(ev => (
                                <option key={ev.id} value={ev.id}>
                                    {ev.name} ({ev.venue || 'Ubicación General'})
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label>Rango Temporal</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="date" name="date_from" value={filters.date_from} onChange={handleFilterChange} className="input-premium" />
                            <input type="date" name="date_to" value={filters.date_to} onChange={handleFilterChange} className="input-premium" />
                        </div>
                    </div>
                    
                    <div className="filter-group">
                        <label>Rango Horario</label>
                        <select name="hour_range" value={filters.hour_range} onChange={handleFilterChange} className="select-premium">
                            <option value="">Todo el día</option>
                            <option value="morning">Mañana (06:00 - 12:00)</option>
                            <option value="afternoon">Tarde (12:00 - 18:00)</option>
                            <option value="night">Noche (18:00 - 00:00)</option>
                            <option value="late_night">Madrugada (00:00 - 06:00)</option>
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label>Tipo de Gráfico 3D</label>
                        <select value={chartType} onChange={(e) => setChartType(e.target.value)} className="select-premium">
                            <option value="3D_BAR">3D Barras Extruidas</option>
                            <option value="3D_SCATTER">3D Puntos Dispersión</option>
                            <option value="2D_PIE">2D Gráfica Pastel</option>
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label>Modo de Color</label>
                        <select value={colorMode} onChange={(e) => setColorMode(e.target.value)} className="select-premium">
                            <option value="palette">Continuo (Degradado Térmico)</option>
                            <option value="solid">Sólido (Por Categoría)</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Rango de Precios</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="number" name="min_price" placeholder="Mín" value={filters.min_price} onChange={handleFilterChange} className="input-premium" />
                            <input type="number" name="max_price" placeholder="Máx" value={filters.max_price} onChange={handleFilterChange} className="input-premium" />
                        </div>
                    </div>

                    {analysisMode === 'ML_PCA' && (
                        <div className="filter-group" style={{ background: '#ecfdf5', padding: '10px', borderRadius: '10px', border: '1px solid #a7f3d0', marginTop: '8px' }}>
                            <label style={{ color: '#065f46', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Número de Perfiles (K)</span>
                                <span style={{ background: '#10b981', color: '#fff', padding: '2px 6px', borderRadius: '6px', fontSize: '0.55rem' }}>RECOMENDADO: 4</span>
                            </label>
                            <input 
                                type="number" 
                                name="k_clusters" 
                                value={filters.k_clusters ?? 4} 
                                onChange={handleFilterChange} 
                                className="input-premium" 
                                min="2" max="8"
                                style={{ borderColor: '#10b981', marginTop: '4px' }}
                            />
                            <span style={{ fontSize: '0.6rem', color: '#047857', marginTop: '4px', lineHeight: '1.2' }}>
                                Define en cuántos grupos quieres dividir a tus clientes. Usa la optimización de Perfiles Ideales si no estás seguro.
                            </span>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '0.5rem' }}>
                        <button 
                            onClick={() => analysisMode === '3D_EXPLORATION' ? executeAnalysis() : executeMLAnalysis(analysisMode)} 
                            style={{ 
                                background: '#1e293b', 
                                color: '#ffffff', 
                                border: 'none', 
                                padding: '0.8rem', 
                                borderRadius: '10px', 
                                fontWeight: 700, 
                                fontSize: '0.8rem', 
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#0f172a'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#1e293b'}
                        >
                            APLICAR FILTROS
                        </button>
                        <button 
                            onClick={handleExportExcel} 
                            style={{ 
                                background: '#f8fafc', 
                                color: '#10b981', 
                                border: '1px solid #10b981', 
                                padding: '0.8rem', 
                                borderRadius: '10px', 
                                fontWeight: 700, 
                                fontSize: '0.8rem', 
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#ecfdf5'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
                        >
                            <Download size={14} /> EXPORTAR CSV
                        </button>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default BigDataFilters;
