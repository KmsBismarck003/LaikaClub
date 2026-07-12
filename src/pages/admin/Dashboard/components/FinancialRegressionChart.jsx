import React, { useState, useMemo, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { 
    AreaChart, 
    TrendingUp, 
    HelpCircle, 
    DollarSign, 
    Award, 
    ChevronDown, 
    Sliders, 
    ShieldCheck, 
    Calendar, 
    Users, 
    Music, 
    Layers, 
    Percent 
} from 'lucide-react';
import { calculateSimulatedRevenue, calculateNewEventSimulation } from './simulationEngine';

export default function FinancialRegressionChart({ mlData, mlLoading, eventsList = [], onRefresh }) {
    const [selectedModel, setSelectedModel] = useState('Polinomial (deg 2)');
    const [showHelp, setShowHelp] = useState(false);
    
    // Pestaña activa del simulador: 'existing' o 'new'
    const [simulatorTab, setSimulatorTab] = useState('existing');

    // Estado del selector de evento para la simulación existente
    const [selectedEventId, setSelectedEventId] = useState('');

    // --- ESTADOS PARA SIMULACIÓN DE EVENTO EXISTENTE ---
    const [simTickets, setSimTickets] = useState(300);
    const [simPrice, setSimPrice] = useState(150);
    const [simFixedCosts, setSimFixedCosts] = useState(25000);
    const [simMarketing, setSimMarketing] = useState(0);
    const [simFunctions, setSimFunctions] = useState(1);

    // --- ESTADOS PARA PLANIFICADOR DE NUEVO EVENTO ---
    const [newCapacity, setNewCapacity] = useState(500);
    const [newFunctions, setNewFunctions] = useState(1);
    const [newPrice, setNewPrice] = useState(250);
    const [newMarketing, setNewMarketing] = useState(5000);
    const [newFixedCosts, setNewFixedCosts] = useState(20000);
    const [newMonth, setNewMonth] = useState(12); // Diciembre por defecto
    const [newGenre, setNewGenre] = useState('pop');

    // Obtener las predicciones y métricas desde el backend
    const { predictions = [], detailed_metrics = {}, best_model: bestModel = '' } = mlData || {};

    // Parámetros de regresión de base calculados con useMemo
    const slopeAndIntercept = useMemo(() => {
        let s = 150.0;
        let i = 0.0;
        if (predictions.length > 1) {
            const xMean = predictions.reduce((acc, p) => acc + p.tickets_sold, 0) / predictions.length;
            const yMean = predictions.reduce((acc, p) => acc + p.actual_income, 0) / predictions.length;
            let num = 0;
            let den = 0;
            predictions.forEach(p => {
                num += (p.tickets_sold - xMean) * (p.actual_income - yMean);
                den += Math.pow(p.tickets_sold - xMean, 2);
            });
            if (den !== 0) {
                s = num / den;
                i = yMean - s * xMean;
            }
        }
        return { slope: s, intercept: i };
    }, [predictions]);

    const slope = slopeAndIntercept.slope;

    // Coeficientes específicos del modelo seleccionado
    const activeCoefs = useMemo(() => {
        const intercept = slopeAndIntercept.intercept;
        const coefficients = mlData?.coefficients;
        if (coefficients && coefficients[selectedModel]) {
            return coefficients[selectedModel];
        }
        // Fallbacks si no hay coeficientes en el backend
        if (selectedModel.includes('Polinomial')) {
            return { coef: [slope * 1.3, -0.05], intercept: intercept };
        } else if (selectedModel.includes('Ridge')) {
            return { coef: [slope * 0.92], intercept: intercept * 0.95 };
        } else if (selectedModel.includes('Lasso')) {
            return { coef: [slope * 0.90], intercept: intercept * 0.90 };
        }
        return { coef: [slope], intercept: intercept };
    }, [mlData, selectedModel, slope, slopeAndIntercept.intercept]);

    // Encontrar el evento seleccionado para simulación existente
    const selectedEvent = useMemo(() => {
        if (simulatorTab === 'existing' && predictions.length > 0) {
            const id = selectedEventId || predictions[0].event_id;
            return predictions.find(p => p.event_id === Number(id)) || predictions[0];
        }
        return null;
    }, [predictions, selectedEventId, simulatorTab]);

    // Sincronizar el simulador de evento existente cuando cambia el evento seleccionado
    useEffect(() => {
        if (selectedEvent) {
            setSimTickets(selectedEvent.tickets_sold || 0);
            setSimPrice(Math.round(selectedEvent.base_price || (selectedEvent.actual_income / (selectedEvent.tickets_sold || 1)) || 150));
            setSimFixedCosts(25000);
            setSimMarketing(0);
            setSimFunctions(1);
        }
    }, [selectedEvent]);

    // Capacidad total del evento existente
    const maxCapacity = useMemo(() => {
        if (selectedEvent) {
            return (selectedEvent.total_tickets || 500) * simFunctions;
        }
        return 1500;
    }, [selectedEvent, simFunctions]);

    // Multiplicador de precio dinámico para el evento existente
    const simPriceMultiplier = useMemo(() => {
        const base = selectedEvent ? selectedEvent.base_price : slope;
        const baseline = base > 0 ? base : 150.0;
        return simPrice / baseline;
    }, [selectedEvent, simPrice, slope]);

    // --- CÁLCULO EN TIEMPO REAL: SIMULACIÓN DE EVENTO EXISTENTE ---
    const simulatedRevenue = useMemo(() => {
        return calculateSimulatedRevenue({
            simTickets,
            simPriceMultiplier,
            simMarketing,
            selectedModel,
            activeCoefs,
            slope
        });
    }, [activeCoefs, selectedModel, simTickets, simPriceMultiplier, simMarketing, slope]);

    const simTotalCosts = Number(simFixedCosts) + Number(simMarketing);
    const simulatedNetBenefit = simulatedRevenue - simTotalCosts;

    // --- CÁLCULO EN TIEMPO REAL: PLANIFICADOR DE NUEVO EVENTO ---
    const newEventSimulation = useMemo(() => {
        return calculateNewEventSimulation({
            newCapacity,
            newFunctions,
            newPrice,
            newMarketing,
            newFixedCosts,
            newMonth,
            newGenre,
            activeCoefs,
            selectedModel,
            slope
        });
    }, [newCapacity, newFunctions, newPrice, newMarketing, newFixedCosts, newMonth, newGenre, activeCoefs, selectedModel, slope]);

    if (mlLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', minHeight: '350px' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #1e293b', borderRadius: '50%', marginBottom: '1rem', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Entrenando modelos matemáticos y calculando márgenes de error...</span>
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (!mlData || !predictions || predictions.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                No hay suficientes datos históricos de ventas para trazar la proyección financiera.
                <button onClick={onRefresh} style={{ marginTop: '1rem', display: 'block', margin: '10px auto', padding: '8px 16px', background: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                    Reintentar Análisis
                </button>
            </div>
        );
    }

    // Obtener lista de modelos y métricas
    const modelsList = detailed_metrics ? Object.keys(detailed_metrics) : ['Lineal Simple', 'Polinomial (deg 2)', 'Ridge', 'Lasso'];
    const currentMetrics = detailed_metrics[selectedModel] || {
        r2: 0.85,
        mae: 1200.0,
        rmse: 15000.0
    };

    // Generar coordenadas para la curva de tendencia en el gráfico
    const xTrend = [];
    const yTrend = [];
    const maxGraphTickets = Math.max(...predictions.map(p => p.total_tickets), 1500);

    // Multiplicador de escala en la gráfica
    const activeMultiplier = simulatorTab === 'existing' ? simPriceMultiplier : (newPrice / (slope || 150.0));

    for (let i = 0; i <= 50; i++) {
        const x = (maxGraphTickets / 50) * i;
        xTrend.push(x);
        
        let y = activeCoefs.intercept;
        const coefs = activeCoefs.coef || [];
        if (selectedModel.includes('Polinomial')) {
            const term1 = coefs[0] !== undefined ? coefs[0] : (slope * 1.3);
            const term2 = coefs[1] !== undefined ? coefs[1] : -0.05;
            y += term1 * x + term2 * Math.pow(x, 2);
        } else {
            const term1 = coefs[0] !== undefined ? coefs[0] : slope;
            y += term1 * x;
        }
        yTrend.push(Math.max(0, y * activeMultiplier));
    }

    // Configurar traces de Plotly
    const actualTrace = {
        x: predictions.map(p => p.tickets_sold),
        y: predictions.map(p => p.actual_income),
        mode: 'markers',
        type: 'scatter',
        name: 'Eventos Reales (Histórico)',
        marker: {
            color: '#475569',
            size: 9,
            line: { color: '#ffffff', width: 1 }
        },
        hovertemplate: '<b>%{text}</b><br>Boletos Vendidos: %{x}<br>Ingresos Reales: $%{y:,.0f} MXN<extra></extra>',
        text: predictions.map(p => p.name)
    };

    const trendTrace = {
        x: xTrend,
        y: yTrend,
        mode: 'lines',
        type: 'scatter',
        name: `Tendencia (${selectedModel})`,
        line: {
            color: selectedModel.includes('Poly') ? '#10b981' : '#3b82f6',
            width: 3,
            shape: selectedModel.includes('Poly') ? 'spline' : 'linear'
        },
        hovertemplate: 'Proyección<br>Boletos: %{x:.0f}<br>Ingreso Proyectado: $%{y:,.0f} MXN<extra></extra>'
    };

    // Coordenadas de la estrella interactiva del simulador
    const starX = simulatorTab === 'existing' ? simTickets : newEventSimulation.tickets;
    const starY = simulatorTab === 'existing' ? simulatedRevenue : newEventSimulation.revenue;

    const simulatedTrace = {
        x: [starX],
        y: [starY],
        mode: 'markers',
        type: 'scatter',
        name: 'Escenario Simulado',
        marker: {
            color: '#ef4444',
            size: 16,
            symbol: 'star',
            line: { color: '#ffffff', width: 2 }
        },
        hovertemplate: '<b>Escenario Simulado</b><br>Boletos: %{x}<br>Ingreso Proyectado: $%{y:,.0f} MXN<extra></extra>'
    };

    const layout = {
        autosize: true,
        height: 380,
        margin: { l: 60, r: 20, t: 30, b: 50 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(248,250,252,0.6)',
        xaxis: {
            title: 'Boletos Vendidos (Aforo)',
            gridcolor: '#e2e8f0',
            linecolor: '#cbd5e1'
        },
        yaxis: {
            title: 'Ingresos ($ MXN)',
            gridcolor: '#e2e8f0',
            linecolor: '#cbd5e1',
            tickformat: '$,.0f'
        },
        legend: {
            orientation: 'h',
            x: 0,
            y: 1.15
        },
        hovermode: 'closest'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* CABECERA Y SELECTOR DE MODELO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AreaChart size={18} style={{ color: '#0f172a' }} />
                        Simulador Financiero Avanzado
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                        Ajusta variables en tiempo real y obtén predicciones basadas en Spark Machine Learning.
                    </p>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Modelo de Predicción:</span>
                    <div style={{ position: 'relative' }}>
                        <select 
                            value={selectedModel} 
                            onChange={(e) => setSelectedModel(e.target.value)}
                            style={{ 
                                appearance: 'none', 
                                background: '#ffffff', 
                                border: '1px solid #cbd5e1', 
                                borderRadius: '10px', 
                                padding: '6px 32px 6px 12px', 
                                fontSize: '0.75rem', 
                                fontWeight: 700, 
                                color: '#1e293b', 
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                        >
                            {modelsList.map(m => (
                                <option key={m} value={m}>
                                    {m} {m === bestModel ? '(Recomendado)' : ''}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
                    </div>
                </div>
            </div>

            {/* PANEL DE MÈTRICAS DE CONFIANZA */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>Fiabilidad R²</span>
                        <Award size={16} style={{ color: '#4f46e5' }} />
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                        {currentMetrics.r2 ? `${Math.round(currentMetrics.r2 * 100)}%` : '85%'}
                    </div>
                    <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                        Capacidad del modelo de explicar la variación de los ingresos de eventos.
                    </p>
                </div>

                <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '1rem', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#b45309', letterSpacing: '0.5px' }}>Error Promedio (MAE)</span>
                        <DollarSign size={16} style={{ color: '#d97706' }} />
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b45309', marginTop: '4px' }}>
                        ±${Math.round(currentMetrics.mae || 1200).toLocaleString()} MXN
                    </div>
                    <p style={{ fontSize: '0.7rem', color: '#b55b0a', margin: '4px 0 0 0', lineHeight: '1.4', opacity: 0.9 }}>
                        Desviación promedio absoluta esperada en las ventas individuales.
                    </p>
                </div>

                <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '1rem', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#b91c1c', letterSpacing: '0.5px' }}>Margen de Riesgo (RMSE)</span>
                        <TrendingUp size={16} style={{ color: '#dc2626' }} />
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b91c1c', marginTop: '4px' }}>
                        ±${Math.round(currentMetrics.rmse || 15000).toLocaleString()} MXN
                    </div>
                    <p style={{ fontSize: '0.7rem', color: '#b91c1c', margin: '4px 0 0 0', lineHeight: '1.4', opacity: 0.9 }}>
                        Medida de penalización de errores grandes. Ideal para fondos de contingencia.
                    </p>
                </div>
            </div>

            {/* SECCIÓN DOBLE: GRÁFICO E INTERACTIVOS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
                
                {/* GRÁFICO INTERACTIVO */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '1.2rem', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
                    <Plot 
                        data={[actualTrace, trendTrace, simulatedTrace]} 
                        layout={layout} 
                        useResizeHandler 
                        style={{ width: '100%', height: '100%' }}
                        config={{ displayModeBar: false }}
                    />
                </div>

                {/* FORMULARIO DEL SIMULADOR */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {/* TABS DEL SIMULADOR */}
                    <div style={{ display: 'flex', background: '#e2e8f0', padding: '4px', borderRadius: '12px', gap: '4px' }}>
                        <button 
                            onClick={() => setSimulatorTab('existing')}
                            style={{
                                flex: 1,
                                padding: '8px',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: simulatorTab === 'existing' ? '#ffffff' : 'transparent',
                                color: simulatorTab === 'existing' ? '#0f172a' : '#64748b',
                                boxShadow: simulatorTab === 'existing' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            Simular Evento Existente
                        </button>
                        <button 
                            onClick={() => setSimulatorTab('new')}
                            style={{
                                flex: 1,
                                padding: '8px',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: simulatorTab === 'new' ? '#ffffff' : 'transparent',
                                color: simulatorTab === 'new' ? '#0f172a' : '#64748b',
                                boxShadow: simulatorTab === 'new' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            Planificar Nuevo Evento
                        </button>
                    </div>

                    {simulatorTab === 'existing' ? (
                        /* ================= SIMULAR EVENTO EXISTENTE ================= */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>
                                    1. SELECCIONAR EVENTO ACTIVO:
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        value={selectedEventId}
                                        onChange={(e) => setSelectedEventId(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            borderRadius: '10px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '0.78rem',
                                            fontWeight: 600,
                                            background: '#ffffff',
                                            outline: 'none',
                                            color: '#0f172a',
                                            appearance: 'none'
                                        }}
                                    >
                                        {predictions.map(p => (
                                            <option key={p.event_id} value={p.event_id}>
                                                {p.name} ({p.venue})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
                                </div>
                                {selectedEvent && (
                                    <span style={{ fontSize: '0.68rem', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>
                                        Capacidad máxima del lugar: <strong>{selectedEvent.total_tickets} personas</strong>.
                                    </span>
                                )}
                            </div>

                            {/* AFORO VENDIDO MANUAL + SLIDER */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Users size={12} /> AFORO VENDIDO (MANUAL):
                                    </label>
                                    <input 
                                        type="number"
                                        min="0"
                                        max={maxCapacity}
                                        value={simTickets}
                                        onChange={(e) => setSimTickets(Math.min(maxCapacity, Math.max(0, parseInt(e.target.value) || 0)))}
                                        style={{
                                            width: '80px',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            textAlign: 'center'
                                        }}
                                    />
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max={maxCapacity} 
                                    value={simTickets} 
                                    onChange={(e) => setSimTickets(parseInt(e.target.value))}
                                    style={{ accentColor: '#0f172a', cursor: 'pointer', width: '100%', marginTop: '4px' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#94a3b8' }}>
                                    <span>0</span>
                                    <span>Límite del lugar: {maxCapacity} boletos</span>
                                </div>
                            </div>

                            {/* PRECIO DE BOLETO MANUAL + SLIDER */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <DollarSign size={12} /> PRECIO DE ENTRADA ($ MXN):
                                    </label>
                                    <input 
                                        type="number"
                                        min="1"
                                        value={simPrice}
                                        onChange={(e) => setSimPrice(Math.max(1, parseInt(e.target.value) || 0))}
                                        style={{
                                            width: '80px',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            textAlign: 'center'
                                        }}
                                    />
                                </div>
                                <input 
                                    type="range" 
                                    min={Math.max(10, Math.round((selectedEvent?.base_price || 150) * 0.3))} 
                                    max={Math.round((selectedEvent?.base_price || 150) * 3)} 
                                    value={simPrice} 
                                    onChange={(e) => setSimPrice(parseInt(e.target.value))}
                                    style={{ accentColor: '#0f172a', cursor: 'pointer', width: '100%', marginTop: '4px' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#94a3b8' }}>
                                    <span>Precio base: ${selectedEvent?.base_price || 150} MXN</span>
                                    <span>Max Sim: ${Math.round((selectedEvent?.base_price || 150) * 3)} MXN</span>
                                </div>
                            </div>

                            {/* COSTOS FIJOS Y MARKETING */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569' }}>COSTOS FIJOS ($):</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={simFixedCosts}
                                        onChange={(e) => setSimFixedCosts(Math.max(0, parseInt(e.target.value) || 0))}
                                        style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '0.75rem',
                                            fontWeight: 700
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569' }}>PUBLICIDAD ($):</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={simMarketing}
                                        onChange={(e) => setSimMarketing(Math.max(0, parseInt(e.target.value) || 0))}
                                        style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '0.75rem',
                                            fontWeight: 700
                                        }}
                                    />
                                </div>
                            </div>

                            {/* NÚMERO DE FUNCIONES (Varios días) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Layers size={12} /> NÚMERO DE FUNCIONES / FECHAS:
                                </label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input 
                                        type="number" 
                                        min="1"
                                        max="10"
                                        value={simFunctions}
                                        onChange={(e) => setSimFunctions(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                                        style={{
                                            width: '70px',
                                            padding: '6px 10px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            textAlign: 'center'
                                        }}
                                    />
                                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                                        Multiplica el aforo total y la proyección acumulada del show.
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ================= PLANIFICADOR DE NUEVO EVENTO (ESCENARIO LIBRE) ================= */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0, fontStyle: 'italic', lineHeight: '1.4' }}>
                                Modela un show desde cero. El motor de IA calculará la asistencia (aforo vendido) y las ganancias usando estacionalidad, marketing y precio.
                            </p>

                            {/* CAPACIDAD Y FUNCIONES */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Users size={12} /> CAPACIDAD DEL LUGAR:
                                    </label>
                                    <input 
                                        type="number" 
                                        min="10" 
                                        max="100000"
                                        value={newCapacity}
                                        onChange={(e) => setNewCapacity(Math.max(10, parseInt(e.target.value) || 10))}
                                        style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '0.75rem',
                                            fontWeight: 700
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Layers size={12} /> FUNCIONES:
                                    </label>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max="30"
                                        value={newFunctions}
                                        onChange={(e) => setNewFunctions(Math.max(1, parseInt(e.target.value) || 1))}
                                        style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            textAlign: 'center'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* PRECIO Y MARKETING */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <DollarSign size={12} /> PRECIO BOLETO ($):
                                    </label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        value={newPrice}
                                        onChange={(e) => setNewPrice(Math.max(1, parseInt(e.target.value) || 1))}
                                        style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '0.75rem',
                                            fontWeight: 700
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Percent size={12} /> MARKETING ($):
                                    </label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={newMarketing}
                                        onChange={(e) => setNewMarketing(Math.max(0, parseInt(e.target.value) || 0))}
                                        style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '0.75rem',
                                            fontWeight: 700
                                        }}
                                    />
                                </div>
                            </div>

                            {/* MES Y GÉNERO */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={12} /> MES DEL AÑO:
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            value={newMonth}
                                            onChange={(e) => setNewMonth(parseInt(e.target.value))}
                                            style={{
                                                width: '100%',
                                                padding: '6px 10px',
                                                borderRadius: '8px',
                                                border: '1px solid #cbd5e1',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                background: '#ffffff',
                                                outline: 'none',
                                                appearance: 'none'
                                            }}
                                        >
                                            <option value="1">Enero</option>
                                            <option value="2">Febrero</option>
                                            <option value="3">Marzo</option>
                                            <option value="4">Abril</option>
                                            <option value="5">Mayo</option>
                                            <option value="6">Junio</option>
                                            <option value="7">Julio</option>
                                            <option value="8">Agosto</option>
                                            <option value="9">Septiembre</option>
                                            <option value="10">Octubre</option>
                                            <option value="11">Noviembre</option>
                                            <option value="12">Diciembre (Pico)</option>
                                        </select>
                                        <ChevronDown size={12} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Music size={12} /> GÉNERO / SHOW:
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            value={newGenre}
                                            onChange={(e) => setNewGenre(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '6px 10px',
                                                borderRadius: '8px',
                                                border: '1px solid #cbd5e1',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                background: '#ffffff',
                                                outline: 'none',
                                                appearance: 'none'
                                            }}
                                        >
                                            <option value="general">General</option>
                                            <option value="pop">Pop (Alta demanda)</option>
                                            <option value="reggaeton">Reggaetón (Lleno Total)</option>
                                            <option value="rock">Rock / Metal</option>
                                            <option value="electronica">Electrónica / EDM</option>
                                            <option value="jazz">Jazz / Blues</option>
                                            <option value="classical">Clásica / Sinfónico</option>
                                        </select>
                                        <ChevronDown size={12} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
                                    </div>
                                </div>
                            </div>

                            {/* COSTOS FIJOS */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569' }}>COSTOS FIJOS OPERACIONALES ($):</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    value={newFixedCosts}
                                    onChange={(e) => setNewFixedCosts(Math.max(0, parseInt(e.target.value) || 0))}
                                    style={{
                                        width: '100%',
                                        padding: '6px 10px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.75rem',
                                        fontWeight: 700
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* ================= RESULTADOS DEL ESCENARIO SIMULADO ================= */}
                    <div style={{ 
                        background: '#ffffff', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '18px', 
                        padding: '1.2rem', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '10px', 
                        marginTop: '0.5rem',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px', display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569' }}>
                                ASISTENCIA ESTIMADA:
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                                {simulatorTab === 'existing' 
                                    ? `${simTickets.toLocaleString()} boletos` 
                                    : `${newEventSimulation.tickets.toLocaleString()} boletos`}
                                <span style={{ fontSize: '0.65rem', color: '#64748b', marginLeft: '6px', fontWeight: 600 }}>
                                    ({Math.round(((simulatorTab === 'existing' ? simTickets : newEventSimulation.tickets) / (simulatorTab === 'existing' ? maxCapacity : (newCapacity * newFunctions))) * 100)}% ocupación)
                                </span>
                            </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Ingreso Proyectado</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                                ${ (simulatorTab === 'existing' ? simulatedRevenue : newEventSimulation.revenue).toLocaleString() } MXN
                            </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Costos Totales (Fijos + Publicidad)</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ef4444' }}>
                                -${ (simulatorTab === 'existing' ? simTotalCosts : newEventSimulation.totalCosts).toLocaleString() } MXN
                            </span>
                        </div>

                        {/* BENEFICIO NETO ESTIMADO CON MARGEN DE ERROR DE CONFIANZA */}
                        <div style={{ 
                            borderTop: '2px solid #0f172a', 
                            paddingTop: '10px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '4px' 
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>
                                    BENEFICIO NETO ESTIMADO:
                                </span>
                                <span style={{ 
                                    fontSize: '1.15rem', 
                                    fontWeight: 900, 
                                    color: (simulatorTab === 'existing' ? simulatedNetBenefit : newEventSimulation.netBenefit) >= 0 ? '#10b981' : '#ef4444' 
                                }}>
                                    ${ (simulatorTab === 'existing' ? simulatedNetBenefit : newEventSimulation.netBenefit).toLocaleString() } MXN
                                </span>
                            </div>
                            
                            {/* RANGO DE CONFIANZA (RMSE) */}
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '4px', 
                                fontSize: '0.68rem', 
                                color: '#4f46e5', 
                                marginTop: '4px', 
                                background: '#f5f3ff', 
                                padding: '6px 10px', 
                                borderRadius: '8px',
                                border: '1px solid #ddd6fe' 
                            }}>
                                <ShieldCheck size={13} color="#4f46e5" style={{ flexShrink: 0 }} />
                                <span>
                                    Margen de confianza comercial: <strong>±${Math.round(currentMetrics.rmse || 15000).toLocaleString()} MXN</strong> (RMSE)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* GLOSARIO DE INTERPRETACIÓN */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px 16px', borderRadius: '14px', fontSize: '0.75rem', color: '#1e3a8a', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <HelpCircle size={22} style={{ color: '#3b82f6', flexShrink: 0 }} />
                <div>
                    <strong>Interpretación Comercial Práctica:</strong> Al usar el simulador de <strong>evento existente</strong> controlas manualmente la venta de boletos. Con el <strong>planificador de nuevo evento</strong> la Inteligencia Artificial estima la asistencia de forma autónoma basándose en tus precios, marketing y la fecha del show. La estrella roja en la gráfica se adaptará a cualquiera de los dos escenarios al instante.
                </div>
            </div>
        </div>
    );
}
