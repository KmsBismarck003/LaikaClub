import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, AnimatedCounter } from '../../../components';
import { useAuth } from '../../../context/AuthContext';
import '../StaffDashboard.css';

const StaffTerminalDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [displayText, setDisplayText] = useState('');
    const fullText = `Consola Operativa • ${user?.firstName || 'Staff'}`;

    const [sessionStats, setSessionStats] = useState({
        scansToday: 0,
        valids: 0,
        incidents: 0,
        hoursActive: 0
    });

    useEffect(() => {
        let index = 0;
        const timer = setInterval(() => {
            setDisplayText(fullText.slice(0, index + 1));
            index++;
            if (index >= fullText.length) clearInterval(timer);
        }, 60);
        return () => clearInterval(timer);
    }, [fullText]);

    useEffect(() => {
        const savedHistory = localStorage.getItem('staff_scan_history');
        if (savedHistory) {
            try {
                const history = JSON.parse(savedHistory);
                const valids = history.filter(h => h.status === 'valid' || h.status === 'used' || (h.valid && !h.alreadyUsed)).length;
                const invalids = history.filter(h => h.status === 'invalid' || (!h.valid && !h.alreadyUsed)).length;
                
                setSessionStats({
                    scansToday: history.length,
                    valids: valids,
                    incidents: invalids,
                    hoursActive: 1
                });
            } catch (e) {
                console.error('Error loading staff session stats', e);
            }
        }
    }, []);

    const shortcuts = [
        { id: 'scan', label: 'Terminal Validación', path: '/staff?tab=scanner', icon: 'checkCircle' },
        { id: 'helpdesk', label: 'Soporte de Entrada', path: '/staff?tab=helpdesk', icon: 'search' },
        { id: 'boxoffice', label: 'Taquilla y Ventas', path: '/staff?tab=boxoffice', icon: 'shoppingBag' },
        { id: 'history', label: 'Registro de Accesos', path: '/staff/history', icon: 'history' },
        { id: 'incidents', label: 'Reporte Incidencias', path: '/staff/incidents', icon: 'alertTriangle' },
        { id: 'events', label: 'Mis Asignaciones', path: '/staff/events', icon: 'calendar' }
    ];

    return (
        <div className="staff-dashboard-page">
            <header className="staff-header">
                <div className="staff-header-content">
                    <h1>
                        <Icon name="shield" size={28} style={{ color: 'var(--staff-accent-primary)' }} />
                        {displayText}
                    </h1>
                    <p className="staff-subtitle">Gestión de Control de Acceso y Servicios de Campo</p>
                </div>
                <div className="staff-health-info" style={{ background: 'var(--staff-bg-card)', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid var(--staff-border)' }}>
                    <div className="staff-health-item">
                        <span className="staff-health-label">Estado Operacional</span>
                        <div className="staff-health-value">
                            <div className="staff-status-dot online"></div>
                            <span>SERVICIO ACTIVO</span>
                        </div>
                    </div>
                </div>
            </header>

            <section aria-label="Metricas Operativas de Sesion">
                <div className="staff-metrics-grid">
                    <div className="staff-metric-card">
                        <div className="staff-metric-data">
                            <span className="staff-metric-label">Total Procesados</span>
                            <div className="staff-metric-number"><AnimatedCounter value={sessionStats.scansToday} /></div>
                        </div>
                        <div className="staff-metric-icon"><Icon name="checkCircle" size={22} /></div>
                    </div>

                    <div className="staff-metric-card">
                        <div className="staff-metric-data">
                            <span className="staff-metric-label">Accesos Válidos</span>
                            <div className="staff-metric-number" style={{ color: 'var(--staff-status-valid)' }}><AnimatedCounter value={sessionStats.valids} /></div>
                        </div>
                        <div className="staff-metric-icon success"><Icon name="check" size={22} /></div>
                    </div>

                    <div className="staff-metric-card">
                        <div className="staff-metric-data">
                            <span className="staff-metric-label">Incidencias y Alertas</span>
                            <div className="staff-metric-number" style={{ color: 'var(--staff-status-error)' }}><AnimatedCounter value={sessionStats.incidents} /></div>
                        </div>
                        <div className="staff-metric-icon error"><Icon name="alertTriangle" size={22} /></div>
                    </div>

                    <div className="staff-metric-card">
                        <div className="staff-metric-data">
                            <span className="staff-metric-label">Tiempo en Turno</span>
                            <div className="staff-metric-number"><AnimatedCounter value={sessionStats.hoursActive} />h</div>
                        </div>
                        <div className="staff-metric-icon"><Icon name="history" size={22} /></div>
                    </div>
                </div>
            </section>

            <section aria-label="Accesos Directos de Operacion">
                <h2 className="staff-section-title">
                    <Icon name="dashboard" size={16} /> Central de Comandos de Campo
                </h2>
                <div className="staff-shortcuts-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                    {shortcuts.map(item => (
                        <div key={item.id} className="staff-shortcut-card" onClick={() => navigate(item.path)} role="button" tabIndex={0} onKeyPress={(e) => e.key === 'Enter' && navigate(item.path)}>
                            <p className="staff-shortcut-label">{item.label}</p>
                            <div className="staff-shortcut-icon"><Icon name={item.icon} size={20} /></div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default StaffTerminalDashboard;
