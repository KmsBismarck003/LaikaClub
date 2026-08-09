import React from 'react';
import { AnimatedCounter } from '../../../components';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import '../StaffDashboard.css';

const StaffStats = ({ history = [] }) => {
    const stats = {
        valid: history.filter(s => s.status === 'valid' || (s.valid && !s.alreadyUsed)).length,
        used: history.filter(s => s.status === 'used' || (s.valid && s.alreadyUsed)).length,
        invalid: history.filter(s => s.status === 'invalid' || (!s.valid && !s.alreadyUsed)).length
    };

    return (
        <section aria-label="Resumen de Lecturas de Entrada">
            <div className="staff-metrics-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 0 }}>
                <div className="staff-metric-card">
                    <div className="staff-metric-data">
                        <span className="staff-metric-label">Ingresos Autorizados</span>
                        <div className="staff-metric-number" style={{ color: 'var(--staff-status-valid)' }}>
                            <AnimatedCounter value={stats.valid} />
                        </div>
                    </div>
                    <div className="staff-metric-icon success"><CheckCircle2 size={22} /></div>
                </div>
                
                <div className="staff-metric-card">
                    <div className="staff-metric-data">
                        <span className="staff-metric-label">Intentos Duplicados (Usado)</span>
                        <div className="staff-metric-number" style={{ color: 'var(--staff-status-warning)' }}>
                            <AnimatedCounter value={stats.used} />
                        </div>
                    </div>
                    <div className="staff-metric-icon warning"><AlertTriangle size={22} /></div>
                </div>
                
                <div className="staff-metric-card">
                    <div className="staff-metric-data">
                        <span className="staff-metric-label">Boletos Inválidos</span>
                        <div className="staff-metric-number" style={{ color: 'var(--staff-status-error)' }}>
                            <AnimatedCounter value={stats.invalid} />
                        </div>
                    </div>
                    <div className="staff-metric-icon error"><XCircle size={22} /></div>
                </div>
            </div>
        </section>
    );
};

export default StaffStats;
