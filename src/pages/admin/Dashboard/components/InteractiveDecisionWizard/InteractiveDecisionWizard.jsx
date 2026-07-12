import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../../../../services/miscService';
import { WIZARD_OBJECTIVES, WIZARD_QUESTIONS } from './wizardLogic';
import './InteractiveDecisionWizard.css';
import {
    Coins,
    TrendingUp,
    Tag,
    Users,
    DollarSign,
    TrendingDown,
    Activity,
    Zap,
    Calendar,
    Clock,
    Star,
    Target,
    Sun,
    CloudRain,
    AlertTriangle,
    CheckCircle,
    Percent,
    PieChart,
    Award,
    AlertCircle,
    Compass,
    CreditCard,
    Wallet,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Play,
    Check,
    Info,
    Terminal,
    HelpCircle
} from 'lucide-react';

const iconMap = {
    Coins,
    TrendingUp,
    Tag,
    Users,
    DollarSign,
    TrendingDown,
    Activity,
    Zap,
    Calendar,
    Clock,
    Star,
    Target,
    Sun,
    CloudRain,
    AlertTriangle,
    CheckCircle,
    Percent,
    PieChart,
    Award,
    AlertCircle,
    Compass,
    CreditCard,
    Wallet,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Play,
    Check,
    Info,
    Terminal,
    HelpCircle
};

const RenderIcon = ({ name, size = 18, ...props }) => {
    const IconComponent = iconMap[name] || HelpCircle;
    return <IconComponent size={size} {...props} />;
};

const TYPE_STYLES = {
    success: { bg: '#f0fdf4', border: '#86efac', iconColor: '#16a34a', icon: 'CheckCircle' },
    warning: { bg: '#fffbeb', border: '#fcd34d', iconColor: '#d97706', icon: 'AlertCircle' },
    info:    { bg: '#eff6ff', border: '#93c5fd', iconColor: '#2563eb', icon: 'Info' }
};

const getCardStyle = (classification) => {
    const name = (classification || '').toLowerCase();
    if (name.includes('dinámica') || name.includes('dinamica') || name.includes('aumento')) {
        return TYPE_STYLES.success;
    }
    if (name.includes('descuento') || name.includes('cupón') || name.includes('cupon') || name.includes('promoción') || name.includes('promocion') || name.includes('emergencia')) {
        return TYPE_STYLES.warning;
    }
    return TYPE_STYLES.info;
};

const InteractiveDecisionWizard = ({ managerId = null, eventsList = [], onSimulationComplete = null }) => {
    const [step, setStep] = useState(0); // 0: Select Event, 1: Select Objective, 2..4: Questions, 5: Review & Run, 6: Results
    const [selectedEventId, setSelectedEventId] = useState('');
    const [selectedObjective, setSelectedObjective] = useState(null);
    const [answers, setAnswers] = useState({ q1: null, q2: null, q3: null });
    const [mlLoading, setMlLoading] = useState(false);
    const [mlData, setMlData] = useState(null);
    const [error, setError] = useState(null);

    // Reiniciar todo
    const handleReset = () => {
        setStep(0);
        setSelectedEventId('');
        setSelectedObjective(null);
        setAnswers({ q1: null, q2: null, q3: null });
        setMlData(null);
        setError(null);
        if (onSimulationComplete) {
            onSimulationComplete(null);
        }
    };

    // Obtener las preguntas del objetivo actual
    const currentQuestions = selectedObjective ? WIZARD_QUESTIONS[selectedObjective.id] : [];

    // Manejar selección de objetivo
    const handleSelectObjective = (obj) => {
        setSelectedObjective(obj);
        setAnswers({ q1: null, q2: null, q3: null });
        setStep(2); // Ir a la primera pregunta
    };

    // Manejar selección de opción
    const handleSelectOption = (questionId, optionValue) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionValue
        }));
    };

    // Avanzar de paso
    const handleNext = () => {
        if (step === 0) {
            setStep(1); // Ir a objetivo
        } else if (step === 1) {
            if (selectedObjective) setStep(2);
        } else if (step >= 2 && step <= 4) {
            const currentQIndex = step - 2;
            const currentQ = currentQuestions[currentQIndex];
            if (answers[currentQ.id]) {
                setStep(step + 1);
            }
        }
    };

    // Retroceder de paso
    const handleBack = () => {
        if (step > 0) {
            if (step === 2) {
                setStep(1); // Volver a objetivo
            } else {
                setStep(step - 1);
            }
        }
    };

    // Ejecutar el análisis interactivo llamando a la API
    const handleRunAnalysis = async () => {
        setMlLoading(true);
        setError(null);
        try {
            const extraParams = {
                objective: selectedObjective.id,
                q1: answers.q1,
                q2: answers.q2,
                q3: answers.q3
            };
            if (selectedEventId) {
                extraParams.event_id = selectedEventId;
            }
            const data = await analyticsAPI.getDecisionTreeML(managerId, extraParams);
            setMlData(data);
            setStep(6); // Ir a Resultados
            if (onSimulationComplete) {
                onSimulationComplete({
                    objective: selectedObjective,
                    answers: answers,
                    results: data
                });
            }
        } catch (err) {
            console.error(err);
            setError('No se pudo procesar la solicitud con el motor de analítica.');
        } finally {
            setMlLoading(false);
        }
    };

    // Calcular la ganancia total extra proyectada
    const totalExtraRevenue = mlData?.predictions?.reduce((acc, curr) => acc + (curr.extra_revenue || 0), 0) || 0;

    return (
        <div className="decision-wizard-container">
            {/* Encabezado */}
            <div className="wizard-header">
                <div className="wizard-title-area">
                    <div className="wizard-title-icon">
                        <RenderIcon name="Terminal" size={20} />
                    </div>
                    <div>
                        <h2>Asistente de Decisiones y Predicción</h2>
                        <p>Configure paso a paso el escenario para ajustar estrategias sin margen de error</p>
                    </div>
                </div>
                
                {step < 6 && (
                    <div className="wizard-steps-indicator">
                        <div className={`step-dot ${step === 0 ? 'active' : step > 0 ? 'completed' : ''}`} />
                        <div className={`step-dot ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`} />
                        <div className={`step-dot ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`} />
                        <div className={`step-dot ${step === 3 ? 'active' : step > 3 ? 'completed' : ''}`} />
                        <div className={`step-dot ${step === 4 ? 'active' : step > 4 ? 'completed' : ''}`} />
                        <div className={`step-dot ${step === 5 ? 'active' : ''}`} />
                    </div>
                )}
            </div>

            {/* Error dismiss alert */}
            {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '12px 16px', borderRadius: '12px', color: '#991b1b', fontSize: '0.8rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RenderIcon name="AlertTriangle" size={16} />
                    <span>{error}</span>
                </div>
            )}

            {/* PASO 0: SELECCIÓN DE EVENTO */}
            {step === 0 && (
                <div className="event-selector-panel">
                    <div className="event-selector-title">
                        <RenderIcon name="Calendar" size={16} />
                        <span>Filtro del Evento</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 1rem 0' }}>
                        Seleccione si desea simular la predicción sobre un evento específico o aplicar las condiciones a todos sus eventos asignados.
                    </p>
                    <select
                        className="event-select-input"
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                    >
                        <option value="">Analizar todos los eventos asignados</option>
                        {eventsList.map(ev => (
                            <option key={ev.id} value={ev.id}>
                                {ev.name} (Precio Base: ${ev.price} MXN)
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* PASO 1: SELECCIÓN DEL OBJETIVO */}
            {step === 1 && (
                <div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: '0 0 10px 0' }}>
                        Seleccione el objetivo que desea alcanzar
                    </h3>
                    <div className="objectives-grid">
                        {WIZARD_OBJECTIVES.map(obj => (
                            <button
                                key={obj.id}
                                className={`objective-card ${selectedObjective?.id === obj.id ? 'selected' : ''}`}
                                onClick={() => handleSelectObjective(obj)}
                            >
                                <div className="objective-card-icon">
                                    <RenderIcon name={obj.icon} size={22} />
                                </div>
                                <h4 className="objective-card-title">{obj.title}</h4>
                                <p className="objective-card-desc">{obj.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* PASOS 2, 3, 4: PREGUNTAS DINÁMICAS */}
            {step >= 2 && step <= 4 && (
                (() => {
                    const currentQIndex = step - 2;
                    const currentQ = currentQuestions[currentQIndex];
                    if (!currentQ) return null;

                    return (
                        <div className="question-container">
                            <h3 className="question-text">{currentQ.label}</h3>
                            <p className="question-desc">{currentQ.description}</p>

                            <div className="options-grid">
                                {currentQ.options.map(opt => (
                                    <button
                                        key={opt.value}
                                        className={`option-card ${answers[currentQ.id] === opt.value ? 'selected' : ''}`}
                                        onClick={() => handleSelectOption(currentQ.id, opt.value)}
                                    >
                                        <div className="option-card-icon">
                                            <RenderIcon name={opt.icon} size={18} />
                                        </div>
                                        <div className="option-card-info">
                                            <span className="option-card-label">{opt.label}</span>
                                            <span className="option-card-desc">{opt.description}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })()
            )}

            {/* PASO 5: REVISIÓN Y LANZAMIENTO */}
            {step === 5 && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <RenderIcon name="CheckCircle" size={18} color="#10b981" />
                        <span>Confirmar Configuración del Escenario</span>
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
                        Verifique las respuestas indicadas. El sistema adaptará las reglas del árbol de decisión para predecir las mejores acciones recomendadas.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#ffffff', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                            <span style={{ color: '#64748b', fontWeight: 500 }}>Ámbito de Análisis:</span>
                            <span style={{ color: '#0f172a', fontWeight: 700 }}>
                                {selectedEventId ? eventsList.find(e => e.id === Number(selectedEventId))?.name || 'Evento Seleccionado' : 'Todos los eventos asignados'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#ffffff', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                            <span style={{ color: '#64748b', fontWeight: 500 }}>Estrategia Elegida:</span>
                            <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedObjective?.title}</span>
                        </div>
                        {currentQuestions.map((q, idx) => {
                            const selectedOpt = q.options.find(o => o.value === answers[q.id]);
                            return (
                                <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#ffffff', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                    <span style={{ color: '#64748b', fontWeight: 500 }}>Pregunta {idx + 1}:</span>
                                    <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedOpt?.label || 'Sin responder'}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* BOTONES DE NAVEGACIÓN (PASO 0 A 5) */}
            {step < 6 && !mlLoading && (
                <div className="wizard-actions">
                    {step > 0 ? (
                        <button className="btn-secondary" onClick={handleBack}>
                            <RenderIcon name="ChevronLeft" size={16} />
                            <span>Atrás</span>
                        </button>
                    ) : <div />}

                    {step < 5 ? (
                        <button
                            className="btn-primary"
                            onClick={handleNext}
                            disabled={
                                (step === 1 && !selectedObjective) ||
                                (step >= 2 && step <= 4 && !answers[currentQuestions[step - 2]?.id])
                            }
                        >
                            <span>Continuar</span>
                            <RenderIcon name="ChevronRight" size={16} />
                        </button>
                    ) : (
                        <button className="btn-primary" style={{ background: '#10b981' }} onClick={handleRunAnalysis}>
                            <RenderIcon name="Play" size={16} />
                            <span>Generar Predicciones</span>
                        </button>
                    )}
                </div>
            )}

            {/* INDICADOR DE CARGA */}
            {mlLoading && (
                <div className="loading-overlay">
                    <div className="spinner" />
                    <span className="loading-text">Calculando modelo y proyectando reglas...</span>
                </div>
            )}

            {/* PASO 6: PANEL DE RESULTADOS */}
            {step === 6 && mlData && (
                <div className="wizard-results-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.4s ease' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                        color: '#ffffff',
                        padding: '1.25rem 1.5rem',
                        borderRadius: '20px',
                        border: '1px solid #334155',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <RenderIcon name="CheckCircle" size={20} color="#10b981" />
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                                Análisis de Escenario Finalizado
                            </h3>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>
                            Se ha procesado la información comercial de los eventos utilizando la lógica estructurada del árbol de decisión. A continuación se presentan las recomendaciones específicas y el impacto proyectado para cada evento.
                        </p>
                    </div>

                    {/* Resumen económico */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem 1.25rem' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estrategia Aplicada</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{selectedObjective?.title || 'Estrategia de Precios'}</div>
                        </div>
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem 1.25rem' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ingreso Adicional Estimado</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: totalExtraRevenue > 0 ? '#16a34a' : '#0f172a', marginTop: '4px' }}>
                                ${totalExtraRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                            </div>
                        </div>
                    </div>

                    {/* Recomendaciones específicas por evento */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h4 style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>
                            Acciones Comerciales por Evento
                        </h4>

                        {mlData.predictions && mlData.predictions.length > 0 ? (
                            mlData.predictions.map((p, idx) => {
                                const cardStyle = getCardStyle(p.classification);
                                return (
                                    <div key={idx} style={{
                                        background: cardStyle.bg,
                                        border: `1px solid ${cardStyle.border}`,
                                        borderRadius: '16px',
                                        padding: '1.25rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px'
                                    }}>
                                        {/* Cabecera de la tarjeta del evento */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                            <div>
                                                <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>
                                                    {p.name}
                                                </h5>
                                                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                                    Precio Base: ${p.price?.toFixed(2)} MXN · Ocupación: {p.ocupacion_pct}% ({p.cantidad_vendida} de {p.total_tickets} entradas)
                                                </span>
                                            </div>
                                            <span style={{
                                                fontSize: '0.65rem',
                                                fontWeight: 800,
                                                background: '#ffffff',
                                                color: cardStyle.iconColor,
                                                border: `1px solid ${cardStyle.border}`,
                                                padding: '3px 10px',
                                                borderRadius: '20px',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                                            }}>
                                                {p.classification}
                                            </span>
                                        </div>

                                        {/* Barra de progreso de ocupación */}
                                        <div style={{ background: 'rgba(0,0,0,0.05)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${Math.min(100, p.ocupacion_pct)}%`,
                                                height: '100%',
                                                background: cardStyle.iconColor,
                                                borderRadius: 99,
                                                transition: 'width 0.6s ease'
                                            }} />
                                        </div>

                                        {/* Recomendación y ganancia */}
                                        <div style={{
                                            borderTop: '1px solid rgba(0,0,0,0.05)',
                                            paddingTop: '10px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: '8px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '240px' }}>
                                                <RenderIcon name={cardStyle.icon} size={15} style={{ color: cardStyle.iconColor, flexShrink: 0 }} />
                                                <span style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600, lineHeight: 1.4 }}>
                                                    {p.recommendation}
                                                </span>
                                            </div>

                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Ingreso Adicional</div>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: p.extra_revenue > 0 ? '#16a34a' : '#64748b' }}>
                                                    {p.extra_revenue > 0 ? `+$${p.extra_revenue.toFixed(2)} MXN` : '0.00 MXN'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.8rem' }}>
                                No se encontraron datos procesados para el escenario seleccionado.
                            </div>
                        )}
                    </div>

                    {/* Botón reiniciar */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button className="btn-secondary" onClick={handleReset}>
                            <RenderIcon name="RefreshCw" size={14} />
                            <span>Configurar Nuevo Escenario</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InteractiveDecisionWizard;
export { InteractiveDecisionWizard };
