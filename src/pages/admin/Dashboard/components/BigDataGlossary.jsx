import React from 'react';
import { HelpCircle, X } from 'lucide-react';

const BigDataGlossary = ({ showGlossary, setShowGlossary }) => {
    if (!showGlossary) return null;

    return (
        <div style={{ 
            padding: '1.8rem', 
            background: '#ffffff', 
            border: '1px solid #e0e7ff', 
            borderRadius: '16px', 
            marginBottom: '1.5rem',
            boxShadow: '0 10px 30px rgba(67, 56, 202, 0.05)',
            position: 'relative',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.8rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HelpCircle color="#4338ca" size={20} /> Guía de Conceptos y Métricas de Tendencias
                </h3>
                <button 
                    onClick={() => setShowGlossary(false)} 
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                >
                    <X size={18} />
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>Precisión de la Predicción (Acierto)</h4>
                    <p style={{ fontSize: '0.75rem', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                        Indica qué tan confiable es el cálculo matemático de ingresos futuros según las ventas reales. Un valor de 0.88 representa un 88% de acierto garantizado.
                    </p>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>Proyecciones y Tendencias</h4>
                    <p style={{ fontSize: '0.75rem', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                        Cálculos que trazan si tus ventas van en aumento constante o si siguen curvas rápidas/lentas en base a tus eventos históricos.
                    </p>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>Estrategia de Precios</h4>
                    <p style={{ fontSize: '0.75rem', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                        Preguntas y caminos lógicos que la computadora sigue sola para darte sugerencias automáticas de precios y promociones según la demanda.
                    </p>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>Métricas Centrales</h4>
                    <p style={{ fontSize: '0.75rem', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                        <b>• Promedio:</b> Ganancia media por evento.
                        <br /><b>• Mediana:</b> El punto intermedio de ganancias.
                        <br /><b>• Moda:</b> El precio de boleto más frecuente.
                    </p>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>Estabilidad de Ingresos (Variación)</h4>
                    <p style={{ fontSize: '0.75rem', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                        Muestra qué tanto varían tus ingresos. Si es alta, tus eventos tienen ganancias muy dispares; si es baja, tus ingresos son constantes.
                    </p>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>Flujo de Análisis</h4>
                    <p style={{ fontSize: '0.75rem', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                        <b>1. Diagnóstico:</b> Datos reales históricos.
                        <br /><b>2. Inferencia:</b> Por qué se dieron los picos.
                        <br /><b>3. Predicción:</b> Comportamiento futuro.
                        <br /><b>4. Prescripción:</b> Recomendaciones a seguir.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BigDataGlossary;
