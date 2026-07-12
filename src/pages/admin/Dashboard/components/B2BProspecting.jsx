import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../../../services/miscService';
import { Card, Modal } from '../../../../components';
import { getB2BDecisionRecommendation } from '../utils/decisionHelper';
import { 
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

const B2BProspecting = () => {
    const [loading, setLoading] = useState(false);
    const [leadsData, setLeadsData] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all'); // all, high, medium
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [showNewLeadModal, setShowNewLeadModal] = useState(false);
    const [submittingLead, setSubmittingLead] = useState(false);
    const [newLeadForm, setNewLeadForm] = useState({
        name: '',
        category: 'Club/Foro',
        capacity: '',
        city: '',
        state: '',
        estimated_events_month: 5,
        contact_email: '',
        phone: ''
    });

    const handleAddLeadSubmit = async (e) => {
        e.preventDefault();
        if (!newLeadForm.name || !newLeadForm.capacity || !newLeadForm.city || !newLeadForm.state) {
            alert('Por favor completa los campos obligatorios: Nombre, Capacidad, Ciudad y Estado.');
            return;
        }
        setSubmittingLead(true);
        try {
            await analyticsAPI.addProspectingLead({
                ...newLeadForm,
                capacity: parseInt(newLeadForm.capacity) || 500,
                estimated_events_month: parseInt(newLeadForm.estimated_events_month) || 5
            });
            setShowNewLeadModal(false);
            setNewLeadForm({
                name: '',
                category: 'Club/Foro',
                capacity: '',
                city: '',
                state: '',
                estimated_events_month: 5,
                contact_email: '',
                phone: ''
            });
            fetchProspectingData();
        } catch (err) {
            console.error('Error adding prospecting lead:', err);
            alert('Ocurrió un error al registrar el prospecto.');
        } finally {
            setSubmittingLead(false);
        }
    };

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

    const decisionRecommendation = React.useMemo(() => {
        if (!leadsData) return null;
        return getB2BDecisionRecommendation(leadsData.market_recommendation, leadsData.leads || []);
    }, [leadsData]);

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
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Recomendador de Empresas y Socios
                </h2>
                <button 
                    onClick={() => setShowHelpModal(true)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: '#64748b' }}
                    title="¿Qué es este apartado?"
                >
                    <HelpCircle size={18} />
                </button>
            </div>

            {/* NOTA DE DATOS REALES */}
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '14px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
                <CheckCircle size={16} style={{ flexShrink: 0, color: '#10b981' }} />
                <span><b>Datos Reales Garantizados:</b> Esta recomendación se genera analizando el historial real de tus eventos e ingresos, cruzando datos de patrocinadores y sedes similares. No son simulaciones ni datos falsos.</span>
            </div>

            {/* RECOMENDACIÓN TÁCTICA Y DECISIONES DE EXPANSIÓN */}
            {decisionRecommendation && (
                <div style={{ 
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
                    border: '1px solid #cbd5e1', 
                    padding: '1.5rem', 
                    borderRadius: '24px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
                    borderLeft: '4px solid #4f46e5'
                }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ background: '#4f46e5', color: '#fff', padding: '10px', borderRadius: '12px', flexShrink: 0 }}>
                            <Sparkles size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                Decisiones de Negocio y Expansión Recomendada
                                <span style={{ background: '#4f46e5', color: '#fff', fontSize: '0.65rem', padding: '3px 8px', borderRadius: '12px', fontWeight: 800, textTransform: 'uppercase' }}>
                                    Análisis y Decisiones Inteligentes
                                </span>
                            </h2>
                            <p 
                                style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.6', margin: 0 }}
                                dangerouslySetInnerHTML={{ __html: cleanEncoding(decisionRecommendation) }}
                            />
                        </div>
                    </div>
                </div>
            )}

            <Modal
                isOpen={showHelpModal}
                onClose={() => setShowHelpModal(false)}
                title="Ayuda - Recomendador de Empresas"
                size="medium"
            >
                <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                        Analiza el rendimiento comercial real (ventas, tickets e ingresos de tus bases de datos relacionales y de MongoDB) de los recintos donde ya vendes boletos en LaikaClub.
                    </p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                        Luego, compara de forma cruzada esos patrones reales con la lista de prospectos comerciales en Spark para recomendarte a qué nuevos patrocinadores y empresas asociadas ofrecerles el servicio con base en una afinidad estadística real.
                    </p>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#047857', fontWeight: 600 }}>
                        ✓ Toda la información mostrada es real y se calcula al instante consultando las bases de datos de tu club.
                    </p>
                </div>
            </Modal>

            {/* MÉTRICAS DE RESUMEN */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <Card style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Building size={20} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Leads Evaluados</span>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{leadsData.total_leads_analyzed}</div>
                        </div>
                    </div>
                </Card>

                <Card style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#f0fdf4', color: '#166534', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Activity size={20} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Patrones Activos</span>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{leadsData.active_patterns_count}</div>
                        </div>
                    </div>
                </Card>

                <Card style={{ padding: '1.2rem', background: '#faf5ff', border: '1px solid #f3e8ff', borderRadius: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#f3e8ff', color: '#6b21a8', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <TrendingUp size={20} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Coincidencia Máxima</span>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#6b21a8' }}>
                                {leadsData.leads?.[0]?.match_score || 0}%
                            </div>
                        </div>
                    </div>
                </Card>

                <Card style={{ padding: '1.2rem', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#fef3c7', color: '#b45309', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Users size={20} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Alta Recomendación</span>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b45309' }}>
                                {leadsData.leads?.filter(l => l.match_score >= 85).length || 0}
                            </div>
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

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setShowNewLeadModal(true)}
                        style={{
                            background: '#000000',
                            border: 'none',
                            color: '#ffffff',
                            padding: '8px 14px',
                            borderRadius: '10px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        <Sparkles size={12} /> Registrar Nuevo Recinto
                    </button>

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
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{cleanEncoding(lead.name)}</h3>
                                    <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '20px', fontWeight: 700 }}>
                                        {cleanEncoding(lead.category)}
                                    </span>
                                    <span style={{ background: `${lead.priority_color}15`, color: lead.priority_color, fontSize: '0.7rem', padding: '3px 8px', borderRadius: '20px', fontWeight: 700 }}>
                                        {cleanEncoding(lead.prospecting_priority)}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem', color: '#64748b' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={12} /> {cleanEncoding(lead.location)}
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
                                    dangerouslySetInnerHTML={{ __html: cleanEncoding(lead.explanation).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
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
                                        navigator.clipboard.writeText(`Nombre: ${cleanEncoding(lead.name)}\nContacto: ${lead.contact.email} / ${lead.contact.phone}\nAfinidad: ${lead.match_score}%`);
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
 
            {/* MODAL PARA AGREGAR NUEVO LEAD */}
            <Modal
                isOpen={showNewLeadModal}
                onClose={() => setShowNewLeadModal(false)}
                title="Registrar Nuevo Recinto / Prospecto B2B"
                size="medium"
            >
                <form onSubmit={handleAddLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>Nombre del Recinto *</label>
                            <input 
                                type="text" 
                                required
                                value={newLeadForm.name} 
                                onChange={e => setNewLeadForm({ ...newLeadForm, name: e.target.value })} 
                                placeholder="Ej. Auditorio Nacional"
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>Categoría *</label>
                            <select 
                                value={newLeadForm.category} 
                                onChange={e => setNewLeadForm({ ...newLeadForm, category: e.target.value })}
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                            >
                                <option value="Arena/Estadio">Arena / Estadio</option>
                                <option value="Teatro/Auditorio">Teatro / Auditorio</option>
                                <option value="Club/Foro">Club / Foro</option>
                                <option value="Club/Antro">Club / Antro</option>
                                <option value="Bar/Restaurante">Bar / Restaurante</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>Capacidad de Personas *</label>
                            <input 
                                type="number" 
                                required
                                min="10"
                                value={newLeadForm.capacity} 
                                onChange={e => setNewLeadForm({ ...newLeadForm, capacity: e.target.value })} 
                                placeholder="Ej. 10000"
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>Eventos Est. al Mes</label>
                            <input 
                                type="number" 
                                min="1"
                                value={newLeadForm.estimated_events_month} 
                                onChange={e => setNewLeadForm({ ...newLeadForm, estimated_events_month: e.target.value })} 
                                placeholder="Ej. 8"
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>Ciudad *</label>
                            <input 
                                type="text" 
                                required
                                value={newLeadForm.city} 
                                onChange={e => setNewLeadForm({ ...newLeadForm, city: e.target.value })} 
                                placeholder="Ej. Querétaro"
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>Estado *</label>
                            <input 
                                type="text" 
                                required
                                value={newLeadForm.state} 
                                onChange={e => setNewLeadForm({ ...newLeadForm, state: e.target.value })} 
                                placeholder="Ej. Querétaro"
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>Email de Contacto</label>
                            <input 
                                type="email" 
                                value={newLeadForm.contact_email} 
                                onChange={e => setNewLeadForm({ ...newLeadForm, contact_email: e.target.value })} 
                                placeholder="contacto@recinto.com"
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>Teléfono de Contacto</label>
                            <input 
                                type="text" 
                                value={newLeadForm.phone} 
                                onChange={e => setNewLeadForm({ ...newLeadForm, phone: e.target.value })} 
                                placeholder="442-123-4567"
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                            />
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                        <button 
                            type="button" 
                            onClick={() => setShowNewLeadModal(false)}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={submittingLead}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#000000', color: '#ffffff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            {submittingLead ? 'Procesando...' : 'Registrar y Analizar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default B2BProspecting;
