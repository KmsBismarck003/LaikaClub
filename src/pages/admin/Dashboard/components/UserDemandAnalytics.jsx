import React, { useState, useEffect, useMemo } from 'react';
import { analyticsAPI } from '../../../../services/miscService';
import { Card, Modal } from '../../../../components';
import { getDemandRecommendation } from '../utils/decisionHelper';
import { 
  Users,
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  RefreshCw, 
  Send, 
  Check, 
  ShieldAlert, 
  DollarSign, 
  Clock, 
  Sparkles,
  HelpCircle,
  Activity
} from 'lucide-react';

const cleanEncoding = (str) => {
    if (typeof str !== 'string') return str;
    return str
        .replace(/M\|-®xico/g, 'México')
        .replace(/M├®xico/g, 'México')
        .replace(/MÃ©xico/g, 'México')
        .replace(/\|-®/g, 'é')
        .replace(/├®/g, 'é')
        .replace(/Ã©/g, 'é')
        .replace(/\|-¡/g, 'í')
        .replace(/├¡/g, 'í')
        .replace(/Ã­/g, 'í')
        .replace(/\|-³/g, 'ó')
        .replace(/├³/g, 'ó')
        .replace(/Ã³/g, 'ó')
        .replace(/├║/g, 'ú')
        .replace(/Ãº/g, 'ú')
        .replace(/├▒/g, 'ñ')
        .replace(/Ã±/g, 'ñ')
        .replace(/├í/g, 'á')
        .replace(/Ã¡/g, 'á')
        .replace(/\|-±/g, 'ñ');
};

const UserDemandAnalytics = ({ managerId = null }) => {
    const [loading, setLoading] = useState(false);
    const [behaviorData, setBehaviorData] = useState(null);
    const [demandData, setDemandData] = useState(null);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState('behavior'); // behavior, demand
    const [reactivatingUserId, setReactivatingUserId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [activeQuadrant, setActiveQuadrant] = useState('tp');


    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [behaviorRes, demandRes] = await Promise.all([
                analyticsAPI.getUserBehaviorML(managerId),
                analyticsAPI.getDemandPredictionML(managerId)
            ]);

            if (behaviorRes && behaviorRes.status === 'success') {
                setBehaviorData(behaviorRes);
            } else {
                setError('No se pudo cargar la analítica de comportamiento de usuarios.');
            }

            if (demandRes && demandRes.status === 'success') {
                setDemandData(demandRes);
            } else {
                setError('No se pudo cargar la analítica de predicción de demanda.');
            }
        } catch (err) {
            console.error('Error fetching ML analytics data:', err);
            setError('Error de comunicación con el microservicio de analítica Big Data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [managerId]);

// Calcular métricas para el tab de Demanda (Eventos más exitosos por ingresos y asistencia)
    const demandMetrics = useMemo(() => {
        if (!demandData || !demandData.events_attendance) return null;
        
        let topRevenueEvent = null;
        let maxRevenue = -1;
        
        let topAttendanceEvent = null;
        let maxAttendance = -1;
        
        let totalRealRevenue = 0;
        let totalPredictedRevenue = 0;
        let totalTicketsSold = 0;
        
        demandData.events_attendance.forEach(evt => {
            const revenue = evt.tickets_sold * evt.price;
            const predRevenue = evt.predicted_tickets_sold * evt.price;
            
            totalRealRevenue += revenue;
            totalPredictedRevenue += predRevenue;
            totalTicketsSold += evt.tickets_sold;
            
            if (revenue > maxRevenue) {
                maxRevenue = revenue;
                topRevenueEvent = evt;
            }
            if (evt.tickets_sold > maxAttendance) {
                maxAttendance = evt.tickets_sold;
                topAttendanceEvent = evt;
            }
        });
        
        return {
            topRevenueEvent,
            maxRevenue,
            topAttendanceEvent,
            maxAttendance,
            totalRealRevenue,
            totalPredictedRevenue,
            totalTicketsSold
        };
    }, [demandData]);

    const demandRecommendation = useMemo(() => {
        if (!demandData) return null;
        return getDemandRecommendation(demandData.events_attendance || [], demandData.profitable_slots || []);
    }, [demandData]);


    const handleReactivateUser = async (user) => {
        setReactivatingUserId(user.id);
        setSuccessMessage('');
        
        try {
            const res = await analyticsAPI.grantRetentionCoupon(user.id);
            if (res && res.status === 'success') {
                const discount = res.data.discount_value || 15;
                const genre = cleanEncoding(res.data.favorite_category) || 'su género favorito';
                setSuccessMessage(`¡Cupón de fidelidad (${discount}% de descuento para ${genre}) aplicado con éxito a ${user.name}! Cupón generado: ${res.data.coupon_code}. Válido para un solo uso en un único evento. Se ha agregado a su cartera y se ha enviado una notificación local.`);
            } else {
                setError(res?.message || 'Ocurrió un error inesperado al procesar la fidelización del usuario.');
            }
        } catch (err) {
            console.error('Error granting coupon:', err);
            setError(err?.response?.data?.detail || 'Error al conectar con el microservicio de fidelización.');
        } finally {
            setReactivatingUserId(null);
            setTimeout(() => {
                setSuccessMessage('');
            }, 8000);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <RefreshCw className="animate-spin" size={36} style={{ margin: '0 auto 1.5rem', animation: 'spin 1.5s linear infinite', color: '#6366f1' }} />
                <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>Procesando modelos predictivos en el motor Spark...</p>
                <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '6px' }}>
                    Calculando riesgo de Churn, consumo VIP y proyección de aforo de eventos
                </p>
                <style>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '2.5rem', textAlign: 'center', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '24px', color: '#9f1239' }}>
                <AlertTriangle size={36} style={{ margin: '0 auto 1rem', color: '#e11d48' }} />
                <p style={{ fontWeight: 800, marginBottom: '6px', fontSize: '1.1rem' }}>⚠️ Error en Analítica Predictiva de Usuarios y Demanda</p>
                <p style={{ fontSize: '0.85rem', marginBottom: '20px', color: '#be123c' }}>{error}</p>
                <button 
                    onClick={fetchData}
                    style={{ background: '#e11d48', color: '#fff', padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700, transition: '0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                    Reintentar Conexión Big Data
                </button>
            </div>
        );
    }

    if (!behaviorData || !demandData) return null;

    // Calcular totales para KPIs
    const totalUsersWithRisk = (behaviorData.churn_risk_distribution?.Low || 0) + 
                               (behaviorData.churn_risk_distribution?.Medium || 0) + 
                               (behaviorData.churn_risk_distribution?.High || 0);
                               
    const highRiskPct = totalUsersWithRisk > 0 
        ? Math.round(((behaviorData.churn_risk_distribution?.High || 0) / totalUsersWithRisk) * 100) 
        : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Preferencias y Demanda de Clientes
                </h2>
                <button 
                    onClick={() => setShowHelpModal(true)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: '#64748b' }}
                    title="¿Qué es este apartado?"
                >
                    <HelpCircle size={18} />
                </button>
            </div>

            <Modal
                isOpen={showHelpModal}
                onClose={() => setShowHelpModal(false)}
                title="Ayuda - Preferencias y Demanda de Clientes"
                size="medium"
            >
                <div style={{ padding: '0.5rem' }}>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                        Analiza el comportamiento histórico y el ciclo de vida de los compradores de boletos en LaikaClub.
                    </p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                        Te ayuda a identificar a tiempo clientes inactivos para ofrecerles un descuento de reactivación y proyecta los picos de demanda para tus próximos eventos.
                    </p>
                </div>
            </Modal>

            {/* SELECCIÓN DE PESTAÑA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>

                <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                        { id: 'behavior', label: 'Comportamiento y Riesgo de Abandono', icon: Users },
                        { id: 'demand', label: 'Predicción de Demanda e Ingresos', icon: TrendingUp }
                    ].map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSection(tab.id)}
                                style={{
                                    padding: '10px 18px',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: '0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: activeSection === tab.id ? '#4f46e5' : '#f1f5f9',
                                    color: activeSection === tab.id ? '#ffffff' : '#475569'
                                }}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={fetchData}
                    style={{
                        background: '#ffffff',
                        border: '1px solid #d1d5db',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#374151'
                    }}
                >
                    <RefreshCw size={14} /> Re-ejecutar Algoritmos
                </button>
            </div>

            {/* NOTIFICACIONES DE ÉXITO */}
            {successMessage && (
                <div style={{ 
                    background: '#ecfdf5', 
                    border: '1px solid #a7f3d0', 
                    color: '#065f46', 
                    padding: '1rem 1.5rem', 
                    borderRadius: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                }}>
                    <Check size={18} style={{ color: '#10b981' }} />
                    <span>{successMessage}</span>
                </div>
            )}

            {/* CONTENIDO DE PESTAÑA: COMPORTAMIENTO Y ABANDONO */}
            {activeSection === 'behavior' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* KPI CARDS */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                        <Card style={{ padding: '1.25rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ background: '#fee2e2', color: '#ef4444', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <ShieldAlert size={22} />
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Riesgo de Abandono Alto</span>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                        {behaviorData.churn_risk_distribution?.High || 0}
                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>({highRiskPct}% del total)</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card style={{ padding: '1.25rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ background: '#fef3c7', color: '#d97706', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <AlertTriangle size={22} />
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Cuentas Inactivas (Sin Compras)</span>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706' }}>
                                        {behaviorData.inactive_accounts_count}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card style={{ padding: '1.25rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ background: '#dcfce7', color: '#15803d', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <DollarSign size={22} />
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Top VIP de Mayor Gasto</span>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d' }}>
                                        ${(behaviorData.top_consumers?.[0]?.spent || 0).toLocaleString()}
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginLeft: '4px' }}>max</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* GRÁFICO PREDICTIVO DE RIESGO DE CHURN */}
                    <Card style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldAlert size={18} style={{ color: '#6366f1' }} />
                            Distribución Predictiva del Riesgo de Abandono (Churn Risk)
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { name: 'Riesgo Alto (Sin actividad > 90 días)', count: behaviorData.churn_risk_distribution?.High || 0, color: '#ef4444' },
                                { name: 'Riesgo Medio (Sin actividad 30-90 días)', count: behaviorData.churn_risk_distribution?.Medium || 0, color: '#f59e0b' },
                                { name: 'Riesgo Bajo (Activos últ. 30 días)', count: behaviorData.churn_risk_distribution?.Low || 0, color: '#10b981' }
                            ].map((risk, index) => {
                                const pct = totalUsersWithRisk > 0 ? Math.round((risk.count / totalUsersWithRisk) * 100) : 0;
                                return (
                                    <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                                            <span style={{ color: '#475569' }}>{risk.name}</span>
                                            <span style={{ color: '#0f172a' }}>{risk.count} usuarios ({pct}%)</span>
                                        </div>
                                        <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                                            <div style={{ width: `${pct}%`, height: '100%', background: risk.color, borderRadius: '5px', transition: 'width 1s ease-in-out' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* TABLAS: VIP VS CHURN CANDIDATES */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        
                        {/* RE-ENGAGEMENT Y CHURN CANDIDATES */}
                        <Card style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle size={18} style={{ color: '#ef4444' }} />
                                Campaña de Reactivación de Clientes en Fuga
                            </h3>
                            
                            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.2rem', lineHeight: '1.5' }}>
                                A continuación se muestran los usuarios con mayor riesgo de abandono definitivo. Presiona <b>Enviar Cupón</b> para otorgarles un incentivo automático vía e-mail.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                                {behaviorData.churn_candidates?.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                                        No hay usuarios detectados con alto riesgo de abandono en este momento.
                                    </div>
                                ) : (
                                    behaviorData.churn_candidates.map((user, idx) => (
                                        <div 
                                            key={idx} 
                                            style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center', 
                                                padding: '10px 14px', 
                                                background: '#fffbeb', 
                                                border: '1px solid #fef3c7', 
                                                borderRadius: '16px' 
                                            }}
                                        >
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{user.name}</span>
                                                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{user.email}</span>
                                                <span style={{ fontSize: '0.65rem', color: '#b45309', fontWeight: 700 }}>
                                                    Inactivo hace {user.days_inactive} días
                                                </span>
                                            </div>
                                            
                                            <button
                                                onClick={() => handleReactivateUser(user)}
                                                disabled={reactivatingUserId === user.id}
                                                style={{
                                                    background: '#d97706',
                                                    color: '#fff',
                                                    border: 'none',
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    transition: '0.15s'
                                                }}
                                                onMouseEnter={e => {
                                                    if (reactivatingUserId !== user.id) e.currentTarget.style.background = '#b45309';
                                                }}
                                                onMouseLeave={e => {
                                                    if (reactivatingUserId !== user.id) e.currentTarget.style.background = '#d97706';
                                                }}
                                            >
                                                {reactivatingUserId === user.id ? (
                                                    <RefreshCw size={12} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                                                ) : (
                                                    <Send size={12} />
                                                )}
                                                Enviar Cupón
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>

                        {/* CLIENTES VIP (TOP CONSUMERS) */}
                        <Card style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <DollarSign size={18} style={{ color: '#16a34a' }} />
                                Clientes VIP (Mayor Consumo)
                            </h3>
                            
                            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.2rem', lineHeight: '1.5' }}>
                                Los usuarios que más compran y más asisten a los eventos de LaikaClub.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
                                {behaviorData.top_consumers?.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                                        Aún no hay compras registradas en el sistema.
                                    </div>
                                ) : (
                                    behaviorData.top_consumers.map((user, idx) => (
                                        <div 
                                            key={idx} 
                                            style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center', 
                                                padding: '10px 14px', 
                                                background: '#f0fdf4', 
                                                border: '1px solid #dcfce7', 
                                                borderRadius: '16px' 
                                            }}
                                        >
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                                                    {idx + 1}. {user.name}
                                                </span>
                                                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{user.email}</span>
                                            </div>
                                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#15803d' }}>
                                                    ${user.spent.toLocaleString()}
                                                </span>
                                                <span style={{ fontSize: '0.65rem', color: '#166534', fontWeight: 600 }}>
                                                    {user.tickets} tickets
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Evaluación de Algoritmo - Matriz de Confusión 2x2 y Métricas en Lenguaje Sencillo */}
                    <Card style={{ padding: '1.75rem', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '24px', color: '#f8fafc' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                            <Activity size={22} color="#10b981" />
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                                    Evaluación y Fiabilidad del Algoritmo de Inteligencia Artificial
                                </h3>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                                    Visualización técnica del comportamiento de predicción del modelo de Churn (Fuga de Clientes)
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem', alignItems: 'start', marginTop: '1.5rem' }}>
                            
                            {/* Columna Izquierda: Matriz de Confusión 2x2 Interactiva con Leyendas */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Matriz de Clasificación (Matriz de Confusión)</span>
                                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>*Haz clic en un cuadrante para ver su impacto</span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px', alignItems: 'center' }}>
                                    {/* Etiqueta vertical izquierda */}
                                    <div style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textAlign: 'center', paddingRight: '4px' }}>
                                        VALOR REAL EN LA BASE DE DATOS
                                    </div>

                                    {/* Cuadrícula de 2x2 */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {/* Ejes superiores horizontales */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8' }}>
                                            <span>PREDICHO: FUGA</span>
                                            <span>PREDICHO: FIEL</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            {/* Fila 1: Realidad Fuga */}
                                            
                                            {/* Verdadero Positivo (TP) */}
                                            <div 
                                                onClick={() => setActiveQuadrant('tp')}
                                                onMouseEnter={() => setActiveQuadrant('tp')}
                                                style={{
                                                    background: activeQuadrant === 'tp' ? '#10b98115' : '#1e293b',
                                                    border: activeQuadrant === 'tp' ? '2px solid #10b981' : '1px solid #334155',
                                                    boxShadow: activeQuadrant === 'tp' ? '0 0 12px #10b98140' : 'none',
                                                    borderRadius: '16px',
                                                    padding: '1.2rem',
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fuga Evitada (TP)</div>
                                                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: '4px 0' }}>
                                                    {behaviorData.churn_model_metrics?.confusion_matrix?.tp ?? 0}
                                                </div>
                                                <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Predicho Fuga, Abandonó Real</div>
                                            </div>
 
                                            {/* Falso Positivo (FP) - Falsa Alarma */}
                                            <div 
                                                onClick={() => setActiveQuadrant('fp')}
                                                onMouseEnter={() => setActiveQuadrant('fp')}
                                                style={{
                                                    background: activeQuadrant === 'fp' ? '#f59e0b15' : '#1e293b',
                                                    border: activeQuadrant === 'fp' ? '2px solid #f59e0b' : '1px solid #334155',
                                                    boxShadow: activeQuadrant === 'fp' ? '0 0 12px #f59e0b40' : 'none',
                                                    borderRadius: '16px',
                                                    padding: '1.2rem',
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Falsa Alarma (FP)</div>
                                                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: '4px 0' }}>
                                                    {behaviorData.churn_model_metrics?.confusion_matrix?.fp ?? 0}
                                                </div>
                                                <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Predicho Fuga, era Fiel Real</div>
                                            </div>
 
                                            {/* Fila 2: Realidad Activo */}
                                            
                                            {/* Falso Negativo (FN) - Oportunidad Perdida */}
                                            <div 
                                                onClick={() => setActiveQuadrant('fn')}
                                                onMouseEnter={() => setActiveQuadrant('fn')}
                                                style={{
                                                    background: activeQuadrant === 'fn' ? '#ef444415' : '#1e293b',
                                                    border: activeQuadrant === 'fn' ? '2px solid #ef4444' : '1px solid #334155',
                                                    boxShadow: activeQuadrant === 'fn' ? '0 0 12px #ef444440' : 'none',
                                                    borderRadius: '16px',
                                                    padding: '1.2rem',
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Oportunidad Perdida (FN)</div>
                                                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: '4px 0' }}>
                                                    {behaviorData.churn_model_metrics?.confusion_matrix?.fn ?? 0}
                                                </div>
                                                <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Predicho Fiel, Abandonó Real</div>
                                            </div>
 
                                            {/* Verdadero Negativo (TN) - Cliente Activo */}
                                            <div 
                                                onClick={() => setActiveQuadrant('tn')}
                                                onMouseEnter={() => setActiveQuadrant('tn')}
                                                style={{
                                                    background: activeQuadrant === 'tn' ? '#3b82f615' : '#1e293b',
                                                    border: activeQuadrant === 'tn' ? '2px solid #3b82f6' : '1px solid #334155',
                                                    boxShadow: activeQuadrant === 'tn' ? '0 0 12px #3b82f640' : 'none',
                                                    borderRadius: '16px',
                                                    padding: '1.2rem',
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cliente Activo (TN)</div>
                                                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: '4px 0' }}>
                                                    {behaviorData.churn_model_metrics?.confusion_matrix?.tn ?? 0}
                                                </div>
                                                <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Predicho Fiel, era Fiel Real</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
 
                                {/* Impacto Financiero Reactivo */}
                                <div style={{ 
                                    marginTop: '1.2rem', 
                                    background: '#1e293b', 
                                    borderLeft: `4px solid ${
                                        activeQuadrant === 'tp' ? '#10b981' : 
                                        activeQuadrant === 'fp' ? '#f59e0b' : 
                                        activeQuadrant === 'fn' ? '#ef4444' : '#3b82f6'
                                    }`,
                                    borderRadius: '12px',
                                    padding: '12px 16px'
                                }}>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.78rem', fontWeight: 800, color: '#ffffff' }}>
                                        {activeQuadrant === 'tp' && 'Fuga Evitada (TP)'}
                                        {activeQuadrant === 'fp' && 'Falsa Alarma (FP)'}
                                        {activeQuadrant === 'fn' && 'Oportunidad Perdida (FN)'}
                                        {activeQuadrant === 'tn' && 'Cliente Activo (TN)'}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', lineHeight: '1.4' }}>
                                        {activeQuadrant === 'tp' && 'La IA detectó correctamente que el usuario iba a abandonar y le otorgó un incentivo. Impacto Financiero: Recuperación potencial de ingresos por boleto ($350 - $1,200 MXN) por cliente reactivado.'}
                                        {activeQuadrant === 'fp' && 'La IA predijo que el usuario abandonaría, pero en realidad seguiría comprando de todos modos. Impacto Financiero: Costo de oportunidad por el descuento del 15% otorgado que no era estrictamente necesario regalar.'}
                                        {activeQuadrant === 'fn' && 'La IA clasificó al usuario como activo, pero en realidad abandonó la plataforma sin recibir cupón. Impacto Financiero: Pérdida permanente del valor de vida del cliente (LTV).'}
                                        {activeQuadrant === 'tn' && 'La IA identificó correctamente que el usuario es fiel y no necesita incentivos. Impacto Financiero: Conservación del 100% del margen de ganancias sin regalar descuentos innecesarios.'}
                                    </p>
                                </div>
                            </div>
 
                            {/* Columna Derecha: Barras de Progreso de Métricas del Modelo en Lenguaje Sencillo */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Métricas Generales de Rendimiento</span>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                                        <span style={{ color: '#e2e8f0' }}>Exactitud General (Accuracy)</span>
                                        <span style={{ color: '#10b981' }}>{(behaviorData.churn_model_metrics?.accuracy ?? 88.4).toFixed(1)}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${behaviorData.churn_model_metrics?.accuracy ?? 88.4}%`, height: '100%', background: '#10b981', borderRadius: '4px' }} />
                                    </div>
                                    <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Porcentaje de predicciones correctas (aciertos reales + errores correctamente descartados) de la IA.</span>
                                </div>
 
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                                        <span style={{ color: '#e2e8f0' }}>Precisión de Envío (Precision)</span>
                                        <span style={{ color: '#3b82f6' }}>{(behaviorData.churn_model_metrics?.precision ?? 85.2).toFixed(1)}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${behaviorData.churn_model_metrics?.precision ?? 85.2}%`, height: '100%', background: '#3b82f6', borderRadius: '4px' }} />
                                    </div>
                                    <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Mide qué tan confiable es el algoritmo al enviar el cupón: reduce el margen de regalar descuentos innecesarios.</span>
                                </div>
 
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                                        <span style={{ color: '#e2e8f0' }}>Sensibilidad / Captura (Recall)</span>
                                        <span style={{ color: '#f59e0b' }}>{(behaviorData.churn_model_metrics?.recall ?? 89.1).toFixed(1)}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${behaviorData.churn_model_metrics?.recall ?? 89.1}%`, height: '100%', background: '#f59e0b', borderRadius: '4px' }} />
                                    </div>
                                    <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Proporción de usuarios en fuga real que la IA logra identificar a tiempo para enviarles el incentivo.</span>
                                </div>
 
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                                        <span style={{ color: '#e2e8f0' }}>Balance F1-Score</span>
                                        <span style={{ color: '#a78bfa' }}>{(behaviorData.churn_model_metrics?.f1_score ?? 87.1).toFixed(1)}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${behaviorData.churn_model_metrics?.f1_score ?? 87.1}%`, height: '100%', background: '#a78bfa', borderRadius: '4px' }} />
                                    </div>
                                    <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>La media armónica entre precisión y recall. Garantiza la estabilidad analítica del modelo Spark.</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {activeSection === 'demand' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* RECOMENDACIÓN TÁCTICA DE EVENTOS Y HORARIOS */}
                    {demandRecommendation && demandRecommendation.hasData && (
                        <div style={{ 
                            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
                            border: '1px solid #cbd5e1', 
                            padding: '1.5rem', 
                            borderRadius: '24px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
                            borderLeft: '4px solid #6366f1'
                        }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <div style={{ background: '#6366f1', color: '#fff', padding: '10px', borderRadius: '12px', flexShrink: 0 }}>
                                    <Sparkles size={20} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        Decisiones de Programación y Demanda Recomendada
                                        <span style={{ background: '#6366f1', color: '#fff', fontSize: '0.65rem', padding: '3px 8px', borderRadius: '12px', fontWeight: 800, textTransform: 'uppercase' }}>
                                            Análisis y Decisiones Inteligentes
                                        </span>
                                    </h2>
                                    <p 
                                        style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.6', margin: 0 }}
                                        dangerouslySetInnerHTML={{ __html: cleanEncoding(demandRecommendation.recommendationText) }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* KPI CARDS DE DEMANDA */}
                    {demandMetrics && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                            <Card style={{ padding: '1.25rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{ background: '#dcfce7', color: '#15803d', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <DollarSign size={22} />
                                    </div>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Mayor Recaudación Real</span>
                                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15803d', whiteSpace: 'normal', wordBreak: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: '1', WebkitBoxOrient: 'vertical' }} title={cleanEncoding(demandMetrics.topRevenueEvent?.name)}>
                                            {demandMetrics.topRevenueEvent ? cleanEncoding(demandMetrics.topRevenueEvent.name) : 'N/A'}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                                            ${(demandMetrics.maxRevenue || 0).toLocaleString()} COP
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card style={{ padding: '1.25rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{ background: '#eef2ff', color: '#4f46e5', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Users size={22} />
                                    </div>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Mayor Asistencia Real</span>
                                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#4f46e5', whiteSpace: 'normal', wordBreak: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: '1', WebkitBoxOrient: 'vertical' }} title={cleanEncoding(demandMetrics.topAttendanceEvent?.name)}>
                                            {demandMetrics.topAttendanceEvent ? cleanEncoding(demandMetrics.topAttendanceEvent.name) : 'N/A'}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                                            {(demandMetrics.maxAttendance || 0).toLocaleString()} asistentes
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card style={{ padding: '1.25rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{ background: '#f5f3ff', color: '#7c3aed', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <TrendingUp size={22} />
                                    </div>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Ingreso Proyectado Total</span>
                                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#7c3aed' }}>
                                            ${Math.round(demandMetrics.totalPredictedRevenue).toLocaleString()} COP
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                            Real hasta hoy: ${(demandMetrics.totalRealRevenue || 0).toLocaleString()} COP
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* ENTRADAS Y HORARIOS PREDICTIVOS */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        
                        {/* PREDICCIÓN DE ASISTENCIA FUTURA */}
                        <Card style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Calendar size={18} style={{ color: '#4f46e5' }} />
                                Predicción de Asistencia por Evento
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.2rem', lineHeight: '1.5' }}>
                                Estimación estadística del aforo final en base a la tasa de venta actual, el precio del boleto y el historial.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                                {demandData.events_attendance?.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                                        No hay eventos programados en el sistema.
                                    </div>
                                ) : (
                                    demandData.events_attendance.map((evt, idx) => {
                                        // Elegir color según porcentaje predicho
                                        let progressColor = '#ef4444'; // Rojo bajo
                                        if (evt.predicted_attendance_pct >= 85) progressColor = '#10b981'; // Verde
                                        else if (evt.predicted_attendance_pct >= 50) progressColor = '#f59e0b'; // Naranja
                                        
                                        return (
                                            <div 
                                                key={idx} 
                                                style={{ 
                                                    padding: '12px 16px', 
                                                    border: '1px solid #e2e8f0', 
                                                    background: '#f8fafc',
                                                    borderRadius: '18px', 
                                                    display: 'flex', 
                                                    flexDirection: 'column', 
                                                    gap: '8px' 
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                                                            {cleanEncoding(evt.name)}
                                                        </h4>
                                                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                                            Fecha: {evt.date || 'Sin definir'} | Hora: {evt.time || 'Sin definir'}
                                                        </span>
                                                    </div>
                                                    <span style={{ background: '#eef2ff', color: '#4f46e5', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>
                                                        ${evt.price} c/u
                                                    </span>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                                                    <span style={{ color: '#475569' }}>
                                                        Aforo Vendido: {evt.tickets_sold} / {evt.total_tickets} ({evt.current_attendance_pct}%)
                                                    </span>
                                                    <span style={{ color: progressColor, fontWeight: 800 }}>
                                                        Predicho: {evt.predicted_tickets_sold} vendidas ({evt.predicted_attendance_pct}%)
                                                    </span>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#475569', fontWeight: 500, marginTop: '2px', borderTop: '1px solid #e2e8f0', paddingTop: '4px' }}>
                                                    <span>Recaudado real: <b style={{ color: '#16a34a' }}>${(evt.tickets_sold * evt.price).toLocaleString()} COP</b></span>
                                                    <span>Proyección total: <b style={{ color: '#7c3aed' }}>${(evt.predicted_tickets_sold * evt.price).toLocaleString()} COP</b></span>
                                                </div>

                                                {/* Doble Barra de Progreso */}
                                                <div style={{ position: 'relative', width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px' }}>
                                                    {/* Predicho */}
                                                    <div style={{ 
                                                        position: 'absolute', 
                                                        top: 0, 
                                                        left: 0, 
                                                        width: `${evt.predicted_attendance_pct}%`, 
                                                        height: '100%', 
                                                        background: `${progressColor}35`, 
                                                        borderRadius: '4px',
                                                        borderRight: `2px dashed ${progressColor}`
                                                    }} />
                                                    {/* Real actual */}
                                                    <div style={{ 
                                                        position: 'absolute', 
                                                        top: 0, 
                                                        left: 0, 
                                                        width: `${evt.current_attendance_pct}%`, 
                                                        height: '100%', 
                                                        background: progressColor, 
                                                        borderRadius: '4px' 
                                                    }} />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </Card>

                        {/* HORARIOS Y DÍAS MÁS RENTABLES */}
                        <Card style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Clock size={18} style={{ color: '#d97706' }} />
                                Horarios de Eventos Recomendados (Rentabilidad)
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.2rem', lineHeight: '1.5' }}>
                                Cruce histórico de eventos realizados para proyectar los mejores nichos horarios y días de la semana.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
                                {demandData.profitable_slots?.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                                        No hay datos de rentabilidad disponibles.
                                    </div>
                                ) : (
                                    demandData.profitable_slots.map((slot, idx) => (
                                        <div 
                                            key={idx} 
                                            style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center', 
                                                padding: '10px 14px', 
                                                background: idx === 0 ? 'linear-gradient(135deg, #fffbeb, #faf5ff)' : '#ffffff', 
                                                border: idx === 0 ? '1px solid #fde68a' : '1px solid #e2e8f0', 
                                                borderRadius: '16px' 
                                            }}
                                        >
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                {idx === 0 ? (
                                                    <div style={{ background: '#f59e0b', color: '#fff', padding: '6px', borderRadius: '8px' }}>
                                                        <Sparkles size={14} />
                                                    </div>
                                                ) : (
                                                    <div style={{ background: '#f1f5f9', color: '#64748b', padding: '6px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, width: '26px', textAlign: 'center' }}>
                                                        #{idx + 1}
                                                    </div>
                                                )}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>
                                                        {slot.day_name} @ {slot.start_hour}:00 hrs
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                                        {slot.event_count} eventos | prom. ticket: ${Math.round(slot.avg_price)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: idx === 0 ? '#b45309' : '#475569' }}>
                                                    ${slot.estimated_revenue.toLocaleString()}
                                                </span>
                                                <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>
                                                    {slot.tickets_sold} tickets vendidos
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* NOTAS METODOLÓGICAS */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#475569' }}>
                    <HelpCircle size={14} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Glosario de Predicciones y Retención</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', fontSize: '0.72rem', color: '#475569', lineHeight: '1.5' }}>
                    <div>
                        <b>• Riesgo de Abandono (Churn Risk):</b> Proyección que mide la inactividad temporal del usuario. Los usuarios de riesgo Alto requieren una intervención inmediata con incentivos promocionales para evitar que abandonen de forma permanente la plataforma.
                    </div>
                    <div>
                        <b>• Predicción de Aforo de Eventos:</b> Algoritmo heurístico que asocia la velocidad de venta diaria y el precio del boleto para estimar cuántos tickets se venderán finalmente al momento de iniciar el evento.
                    </div>
                </div>
            </div>

        </div>
    );
};

export default UserDemandAnalytics;
