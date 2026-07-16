import React from 'react';
import { Database as DatabaseIcon, Check } from 'lucide-react';
import { Card } from '../../../../components';

const BigDataMetrics = ({ selectedTable, canonicalData }) => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
            <Card style={{ 
                padding: '1.5rem', 
                background: 'var(--bg-card, #ffffff)', 
                border: '1px solid var(--border-color, #e2e8f0)', 
                borderRadius: '24px', 
                position: 'relative', 
                overflow: 'hidden', 
                boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', background: '#111827' }}></div>
                
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    INTELIGENCIA DE NEGOCIO
                </div>
                
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', lineHeight: '1.2' }}>
                    Mapeo de Solidez Geográfica
                </div>
                
                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', marginBottom: '1.5rem', flexGrow: 1 }}>
                    Renderizado inmersivo de <b style={{ color: '#111827' }}>{selectedTable}</b>. La altimetría refleja el volumen financiero captado y normalizado para los análisis tácticos que has filtrado.
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', background: '#f1f5f9', padding: '10px 16px', borderRadius: '12px', width: 'fit-content', border: '1px solid #e2e8f0' }}>
                    <DatabaseIcon size={16} color="#111827" /> {canonicalData.length} Registros Activos
                </div>
            </Card>

            <Card style={{ 
                padding: '1.8rem', 
                background: 'var(--bg-card, #ffffff)', 
                border: '1px solid var(--border-color, #e2e8f0)', 
                borderRadius: '24px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                boxShadow: '0 10px 30px rgba(0,0,0,0.03)' 
            }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Ingreso Consolidado (Filtro Actual)
                </div>
                
                <div style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '1.5rem', color: '#0f172a', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    ${canonicalData.reduce((acc, d) => acc + d.val_num, 0).toLocaleString()} 
                    <span style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: 600 }}>MXN</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.2rem', marginTop: 'auto' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                        Pico Máximo: <strong style={{ color: '#1e293b', marginLeft: '6px' }}>{canonicalData[0]?.producto?.substring(0, 30) || '---'}</strong>
                    </div>
                    <div style={{ background: '#ecfdf5', color: '#10b981', padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #a7f3d0' }}>
                        <Check size={14} strokeWidth={3}/> VALIDADO
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default BigDataMetrics;
