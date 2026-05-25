import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../../../services/miscService';
import { Card } from '../../../../components';
import { 
  Search, 
  MapPin, 
  Mail, 
  Phone, 
  CheckCircle, 
  Sparkles, 
  Activity, 
  TrendingUp, 
  Building, 
  Users,
  RefreshCw,
  HelpCircle
} from 'lucide-react';

const B2BProspecting = () => {
    const [loading, setLoading] = useState(false);
    const [leadsData, setLeadsData] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all'); // all, high, medium

    const fetchProspectingData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await analyticsAPI.getProspectingML();
            if (res && res.status === 'success') {
                setLeadsData(res);
            } else {
                setError('No se pudo obtener la información de prospección.');
            }
        } catch (err) {
            console.error('Error fetching prospecting data:', err);
            setError('Error de comunicación con el motor de analítica Big Data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProspectingData();
    }, []);

    const filteredLeads = React.useMemo(() => {
        if (!leadsData || !leadsData.leads) return [];
        if (activeTab === 'high') {
            return leadsData.leads.filter(lead => lead.match_score >= 85);
        }
        if (activeTab === 'medium') {
            return leadsData.leads.filter(lead => lead.match_score >= 65 && lead.match_score < 85);
        }
        return leadsData.leads;
    }, [leadsData, activeTab]);

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 1rem', animation: 'spin 1.5s linear infinite' }} />
                <p style={{ fontWeight: 600 }}>Procesando clústeres en Spark y comparando leads NoSQL...</p>
                <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>Calculando similitud y afinidad comercial en tiempo real</p>
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
            <div style={{ padding: '2rem', textAlign: 'center', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '16px', color: '#991b1b' }}>
                <p style={{ fontWeight: 700, marginBottom: '8px' }}>⚠️ Error en la Analítica de Prospección</p>
                <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>{error}</p>
                <button 
                    onClick={fetchProspectingData}
                    style={{ background: '#991b1b', color: '#fff', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                    Reintentar Conexión
                </button>
            </div>
        );
    }

    if (!leadsData) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* EXPLICACIÓN SIMPLE */}
            <div style={{ background: 'linear-gradient(135deg, #eef2ff, #faf5ff)', border: '1px solid #e0e7ff', padding: '1.5rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ background: '#4f46e5', color: '#fff', padding: '10px', borderRadius: '12px' }}>
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                            Modelado de Semejantes B2B (Lookalike Modeling)
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                            <b>¿Cómo funciona esto?</b> Analizamos el rendimiento comercial (ventas, tickets e ingresos) de los recintos donde ya vendes boletos en LaikaClub y creamos "patrones de éxito" (clústeres). Luego, comparamos de forma cruzada esos patrones con la lista de prospectos guardada en <b>MongoDB</b> para recomendarte a qué nuevos negocios ofrecerles el servicio con base en una afinidad estadística matemática.
                        </p>
                    </div>
                </div>
            </div>

            {/* DEDUCCIÓN DE OPORTUNIDAD DE MERCADO */}
            {leadsData.market_recommendation && (
                <div style={{ 
                    background: 'linear-gradient(135deg, #fffbeb, #fffbeb)', 
                    border: '1px solid #fde68a', 
                    padding: '1.5rem', 
                    borderRadius: '24px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ background: '#d97706', color: '#fff', padding: '10px', borderRadius: '12px', flexShrink: 0 }}>
                            <TrendingUp size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#78350f', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                💡 Deducción de Expansión de Mercado Más Conveniente
                                <span style={{ background: '#d97706', color: '#fff', fontSize: '0.65rem', padding: '3px 8px', borderRadius: '12px', fontWeight: 800, textTransform: 'uppercase' }}>
                                    Recomendación Big Data
                                </span>
                            </h2>
                            <p 
                                style={{ fontSize: '0.85rem', color: '#92400e', lineHeight: '1.6', margin: 0 }}
                                dangerouslySetInnerHTML={{ __html: leadsData.market_recommendation.reasoning.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* MÉTRICAS DE RESUMEN */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <Card style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px' }}>
                    <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '8px', borderRadius: '10px' }}>
                        <Building size={20} />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Leads Evaluados</span>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{leadsData.total_leads_analyzed}</div>
                    </div>
                </Card>

                <Card style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px' }}>
                    <div style={{ background: '#f0fdf4', color: '#166534', padding: '8px', borderRadius: '10px' }}>
                        <Activity size={20} />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Patrones Activos</span>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{leadsData.active_patterns_count}</div>
                    </div>
                </Card>

                <Card style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '12px', background: '#faf5ff', border: '1px solid #f3e8ff', borderRadius: '18px' }}>
                    <div style={{ background: '#f3e8ff', color: '#6b21a8', padding: '8px', borderRadius: '10px' }}>
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Coincidencia Máxima</span>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#6b21a8' }}>
                            {leadsData.leads?.[0]?.match_score || 0}%
                        </div>
                    </div>
                </Card>

                <Card style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '12px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '18px' }}>
                    <div style={{ background: '#fef3c7', color: '#b45309', padding: '8px', borderRadius: '10px' }}>
                        <Users size={20} />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Alta Recomendación</span>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b45309' }}>
                            {leadsData.leads?.filter(l => l.match_score >= 85).length || 0}
                        </div>
                    </div>
                </Card>
            </div>

            {/* SELECCIÓN DE FILTROS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                        { id: 'all', label: `Todos los Prospectos (${leadsData.leads?.length || 0})` },
                        { id: 'high', label: `Lookalike Perfecto (>=85% Match)` },
                        { id: 'medium', label: `Viables (65% - 84% Match)` }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: '0.2s',
                                background: activeTab === tab.id ? '#4f46e5' : '#f1f5f9',
                                color: activeTab === tab.id ? '#ffffff' : '#475569'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <button
                    onClick={fetchProspectingData}
                    style={{
                        background: '#ffffff',
                        border: '1px solid #d1d5db',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#374151'
                    }}
                >
                    <RefreshCw size={12} /> Actualizar Modelo
                </button>
            </div>

            {/* LISTA DE PROSPECTOS RECOMENDADOS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredLeads.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                        No hay prospectos en esta categoría en este momento.
                    </div>
                ) : (
                    filteredLeads.map((lead, index) => (
                        <Card 
                            key={index} 
                            style={{ 
                                padding: '1.25rem', 
                                background: '#ffffff', 
                                border: '1px solid #e2e8f0', 
                                borderRadius: '20px', 
                                display: 'flex', 
                                gap: '1.5rem', 
                                alignItems: 'center',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.08)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                            }}
                        >
                            {/* Círculo de Afinidades */}
                            <div style={{ 
                                width: '70px', 
                                height: '70px', 
                                borderRadius: '50%', 
                                background: `conic-gradient(${lead.priority_color} ${lead.match_score}%, #f1f5f9 0)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                position: 'relative'
                            }}>
                                <div style={{ 
                                    width: '58px', 
                                    height: '58px', 
                                    borderRadius: '50%', 
                                    background: '#ffffff',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>{lead.match_score}%</span>
                                    <span style={{ fontSize: '0.55rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginTop: '-2px' }}>Afinidad</span>
                                </div>
                            </div>

                            {/* Detalle del Lead */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{lead.name}</h3>
                                    <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '20px', fontWeight: 700 }}>
                                        {lead.category}
                                    </span>
                                    <span style={{ background: `${lead.priority_color}15`, color: lead.priority_color, fontSize: '0.7rem', padding: '3px 8px', borderRadius: '20px', fontWeight: 700 }}>
                                        {lead.prospecting_priority}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem', color: '#64748b' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={12} /> {lead.location}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Users size={12} /> Capacidad: <strong>{lead.capacity.toLocaleString()}</strong>
                                    </div>
                                </div>

                                {/* Explicación Detallada */}
                                <p 
                                    style={{ 
                                        margin: '6px 0 0 0', 
                                        fontSize: '0.8rem', 
                                        color: '#334155', 
                                        lineHeight: '1.5',
                                        background: '#f8fafc',
                                        padding: '10px 14px',
                                        borderRadius: '12px',
                                        borderLeft: `3px solid ${lead.priority_color}`
                                    }}
                                    dangerouslySetInnerHTML={{ __html: lead.explanation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                                />
                            </div>

                            {/* Panel de Contacto Comercial */}
                            <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '1px solid #e2e8f0', paddingLeft: '1.5rem', flexShrink: 0 }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contacto Comercial</div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    <Mail size={12} style={{ color: '#4f46e5', flexShrink: 0 }} />
                                    <span title={lead.contact.email}>{lead.contact.email}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#334155' }}>
                                    <Phone size={12} style={{ color: '#4f46e5', flexShrink: 0 }} />
                                    <span>{lead.contact.phone}</span>
                                </div>

                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`Nombre: ${lead.name}\nContacto: ${lead.contact.email} / ${lead.contact.phone}\nAfinidad: ${lead.match_score}%`);
                                        alert('Datos de contacto copiados al portapapeles.');
                                    }}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #cbd5e1',
                                        color: '#475569',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        padding: '6px 0',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        marginTop: '4px',
                                        textAlign: 'center',
                                        transition: '0.15s'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = '#f8fafc';
                                        e.currentTarget.style.borderColor = '#94a3b8';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.borderColor = '#cbd5e1';
                                    }}
                                >
                                    Copiar Contacto
                                </button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* GLOSARIO DE TÉRMINOS */}
            <div style={{ marginTop: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#475569' }}>
                    <HelpCircle size={14} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Glosario de Conceptos Big Data (Sin tecnicismos)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.75rem', color: '#475569', lineHeight: '1.5' }}>
                    <div>
                        <b>• Afinidad Comercial:</b> Porcentaje matemático que indica qué tan parecidos son el tamaño del recinto y su especialidad a los recintos que ya te están dejando ganancias hoy en día.
                    </div>
                    <div>
                        <b>• Lookalike (Semejantes):</b> Técnica que identifica negocios que aún no son clientes tuyos pero que tienen las mismas cualidades y comportamiento que tus mejores clientes actuales.
                    </div>
                </div>
            </div>

        </div>
    );
};

export default B2BProspecting;
