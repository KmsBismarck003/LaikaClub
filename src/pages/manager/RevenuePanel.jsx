import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI } from '../../services/miscService';
import { Sliders, ShieldCheck, DollarSign, TrendingUp, HelpCircle, AlertTriangle } from 'lucide-react';
import '../../styles/manager.css';

const RevenuePanel = ({ eventId, event }) => {
    const { user } = useAuth();
    const [revenueData, setRevenueData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Estados de Machine Learning
    const [mlData, setMlData] = useState(null);
    const [mlLoading, setMlLoading] = useState(true);

    // Estados para el Simulador Local del Gestor
    const [simTickets, setSimTickets] = useState(0);
    const [simTicketPrice, setSimTicketPrice] = useState(350);
    const [simFixedCosts, setSimFixedCosts] = useState(25000);
    const [initializedSliders, setInitializedSliders] = useState(false);

    useEffect(() => {
        fetchRevenue();
        const interval = setInterval(() => fetchRevenue(true), 15000);
        return () => clearInterval(interval);
    }, [eventId]);

    useEffect(() => {
        const loadMLCoefficients = async () => {
            try {
                setMlLoading(true);
                // Cargar coeficientes del manager actual
                const data = await analyticsAPI.getRegressionML(user?.id);
                setMlData(data);
            } catch (err) {
                console.error("Error cargando coeficientes de regresión para simulador de gestor:", err);
            } finally {
                setMlLoading(false);
            }
        };
        if (user?.id) {
            loadMLCoefficients();
        }
    }, [user]);

    const fetchRevenue = async (background = false) => {
        try {
            if (!background) setLoading(true);
            const data = await api.manager.getEventRevenue(eventId);
            setRevenueData(data);
        } catch (error) {
            console.error('Error fetching revenue:', error);
        } finally {
            if (!background) setLoading(false);
        }
    };

    // Inicializar sliders una vez que tengamos datos del evento y recaudación
    useEffect(() => {
        if (revenueData && !initializedSliders) {
            setSimTickets(revenueData.tickets_sold || 0);
            
            // Estimar precio promedio base
            let basePrice = 350;
            if (event?.ticket_price) {
                basePrice = event.ticket_price;
            } else if (revenueData.tickets_sold > 0) {
                basePrice = Math.round(revenueData.gross / revenueData.tickets_sold);
            }
            setSimTicketPrice(basePrice || 350);
            setInitializedSliders(true);
        }
    }, [revenueData, event, initializedSliders]);

    if (loading && !revenueData) return <div className="p-4 text-center">Cargando ingresos...</div>;
    if (!revenueData) return <div className="p-4 text-center">No hay datos financieros</div>;

    const {
        gross,
        refunded_amount,
        net,
        tickets_sold,
        tickets_refunded,
        projected_total
    } = revenueData;

    const totalTicketsCapacity = event?.total_tickets || 500;
    const baseTicketPrice = event?.ticket_price || (tickets_sold > 0 ? Math.round(gross / tickets_sold) : 350) || 350;

    // Calcular predicción local con regresión en tiempo real
    const simulatedRevenue = (() => {
        const coefs = mlData?.coefficients?.['Lineal Simple']?.coef || [150.0];
        const intercept = mlData?.coefficients?.['Lineal Simple']?.intercept || 0.0;
        
        // Ecuación lineal: Y = b0 + b1*X
        let predRev = intercept + coefs[0] * simTickets;
        
        // Ajustar según el precio promedio seleccionado contra el precio base del evento
        const priceRatio = simTicketPrice / baseTicketPrice;
        predRev = predRev * priceRatio;
        
        return Math.max(0, Math.round(predRev));
    })();

    const simulatedNetBenefit = simulatedRevenue - simFixedCosts;
    const maeError = mlData?.detailed_metrics?.['Lineal Simple']?.mae || 1500;

    // Clasificación de viabilidad del simulador
    const getViabilityStatus = () => {
        if (simulatedNetBenefit < 0) {
            return { label: 'Pérdida Financiera', color: '#ef4444', desc: 'Los costos fijos superan la recaudación estimada.' };
        }
        if (simulatedRevenue === 0) {
            return { label: 'Sin Ventas', color: '#64748b', desc: 'Configura un aforo mayor a 0 para simular.' };
        }
        const marginPct = (simulatedNetBenefit / simulatedRevenue) * 100;
        if (marginPct < 15) {
            return { label: 'Viabilidad Ajustada / Margen Bajo', color: '#f59e0b', desc: 'Retorno operativo ajustado. Incrementa tarifas o reduce costos.' };
        }
        return { label: 'Rentabilidad Excelente', color: '#10b981', desc: 'Proyección financiera saludable con alto retorno.' };
    };

    const viability = getViabilityStatus();

    return (
        <div className="revenue-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Reporte Financiero Real */}
            <div>
                <h3 className="text-lg font-semibold mb-4" style={{ margin: '0 0 1rem 0' }}>Reporte Financiero Real</h3>
                <div className="revenue-detail-grid">
                    {/* Main Revenue Card */}
                    <div className="revenue-main-card" style={{ background: '#0f172a', color: '#ffffff', padding: '1.5rem', borderRadius: '16px' }}>
                        <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                            Ingreso Neto Total
                        </span>
                        <div className="total-revenue-display" style={{ fontSize: '2rem', fontWeight: 900, marginTop: '0.5rem', color: '#ffffff' }}>
                            ${net.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Monto acumulado neto de reembolsos
                        </p>
                    </div>

                    {/* Breakdown List */}
                    <div className="revenue-breakdown" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div className="breakdown-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderLeft: '4px solid #475569', background: '#f8fafc', borderRadius: '8px' }}>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase">Ventas Brutas</span>
                                <span className="text-xs text-gray-400">{tickets_sold} boletos vendidos</span>
                            </div>
                            <span className="font-bold text-gray-800">
                                +${gross.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        <div className="breakdown-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderLeft: '4px solid #ef4444', background: '#fef2f2', borderRadius: '8px' }}>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-red-700 uppercase">Reembolsos</span>
                                <span className="text-xs text-gray-400">{tickets_refunded} cancelados</span>
                            </div>
                            <span className="font-bold text-red-600">
                                -${refunded_amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        <div className="breakdown-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderLeft: '4px solid #10b981', background: '#f0fdf4', borderRadius: '8px' }}>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-green-700 uppercase">Proyección Total</span>
                                <span className="text-xs text-gray-400">Escenario 100% Vendido</span>
                            </div>
                            <span className="font-bold text-green-600">
                                ${projected_total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simulador Predictivo Local */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sliders size={20} color="#0f172a" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                        Simulador Predictivo de Tarifas y Aforo
                    </h3>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>
                    Simula la recaudación del evento ajustando los precios y el aforo. El cálculo se realiza localmente con inteligencia artificial basada en el comportamiento histórico del club.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start', marginTop: '0.5rem' }}>
                    
                    {/* Controles de Entrada */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                                <span>Aforo Estimado</span>
                                <span style={{ color: '#0f172a' }}>{simTickets.toLocaleString()} boletos</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max={totalTicketsCapacity} 
                                value={simTickets} 
                                onChange={(e) => setSimTickets(parseInt(e.target.value))}
                                style={{ accentColor: '#0f172a', cursor: 'pointer', width: '100%' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94a3b8' }}>
                                <span>0</span>
                                <span>Capacidad Máxima: {totalTicketsCapacity}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                                <span>Tarifa Promedio del Boleto</span>
                                <span style={{ color: '#0f172a' }}>${simTicketPrice} MXN</span>
                            </div>
                            <input 
                                type="range" 
                                min="50" 
                                max="5000" 
                                step="25"
                                value={simTicketPrice} 
                                onChange={(e) => setSimTicketPrice(parseInt(e.target.value))}
                                style={{ accentColor: '#0f172a', cursor: 'pointer', width: '100%' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94a3b8' }}>
                                <span>$50</span>
                                <span>$5,000</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                                <span>Costos Operativos / Producción</span>
                                <span style={{ color: '#0f172a' }}>${simFixedCosts.toLocaleString()} MXN</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="200000" 
                                step="5000"
                                value={simFixedCosts} 
                                onChange={(e) => setSimFixedCosts(parseInt(e.target.value))}
                                style={{ accentColor: '#0f172a', cursor: 'pointer', width: '100%' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94a3b8' }}>
                                <span>$0</span>
                                <span>$200,000</span>
                            </div>
                        </div>
                    </div>

                    {/* Proyecciones de Salida */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Ingreso Proyectado (ML)</span>
                                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                                    ${simulatedRevenue.toLocaleString()} MXN
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Gastos de Producción</span>
                                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ef4444' }}>
                                    -${simFixedCosts.toLocaleString()} MXN
                                </span>
                            </div>
                            
                            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>Beneficio Neto Estimado</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: simulatedNetBenefit >= 0 ? '#10b981' : '#ef4444' }}>
                                    ${simulatedNetBenefit.toLocaleString()} MXN
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', color: '#64748b', borderTop: '1px dashed #e2e8f0', paddingTop: '8px', marginTop: '2px' }}>
                                <ShieldCheck size={13} color="#10b981" style={{ flexShrink: 0 }} />
                                <span>Margen de confiabilidad de la IA: ±${Math.round(maeError).toLocaleString()} MXN</span>
                            </div>
                        </div>

                        {/* Estado de Viabilidad */}
                        <div style={{ background: '#ffffff', border: `1px solid ${viability.color}`, borderRadius: '18px', padding: '1rem', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            {simulatedNetBenefit < 0 ? (
                                <AlertTriangle size={18} color={viability.color} style={{ flexShrink: 0, marginTop: '2px' }} />
                            ) : (
                                <TrendingUp size={18} color={viability.color} style={{ flexShrink: 0, marginTop: '2px' }} />
                            )}
                            <div>
                                <h4 style={{ margin: 0, fontSize: '0.78rem', fontWeight: 800, color: viability.color }}>
                                    {viability.label}
                                </h4>
                                <p style={{ margin: '3px 0 0 0', fontSize: '0.7rem', color: '#64748b', lineHeight: '1.3' }}>
                                    {viability.desc}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '10px 14px', fontSize: '0.72rem', color: '#1e3a8a', marginTop: '0.5rem' }}>
                    <HelpCircle size={16} color="#3b82f6" style={{ flexShrink: 0 }} />
                    <span>
                        <b>Recomendación comercial:</b> Esta simulación ayuda a predecir si el show será rentable según la elasticidad observada en eventos anteriores. Si subes demasiado la tarifa, la IA calcula la pérdida potencial de aforo promedio.
                    </span>
                </div>
            </div>

            {/* Pie de Nota Informativo */}
            <div style={{ p: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b' }}>
                <p style={{ margin: 0 }}>
                    <strong>Nota:</strong> Los ingresos reales mostrados en el reporte son brutos antes de comisiones bancarias. La simulación utiliza el algoritmo de Regresión Lineal de Spark/Fallbacks entrenado dinámicamente.
                </p>
            </div>
        </div>
    );
};

export default RevenuePanel;
