import React from 'react';
import { Card, AnimatedCounter } from '../../../../components';

const TerminalMetrics = ({ sessionStats }) => {
    return (
        <div className="staff-metrics-strip">
            <Card className="metric-mini">
                <small>Escaneos Sesión</small>
                <strong><AnimatedCounter value={sessionStats.total} /></strong>
            </Card>
            <Card className="metric-mini">
                <small>Válidos Hoy</small>
                <strong style={{ color: 'var(--success)' }}><AnimatedCounter value={sessionStats.valids} /></strong>
            </Card>
            <Card className="metric-mini">
                <small>Incidencias</small>
                <strong style={{ color: 'var(--error)' }}><AnimatedCounter value={sessionStats.invalids} /></strong>
            </Card>
            <Card className="metric-mini">
                <small>Flujo (asist/min)</small>
                <strong style={{ color: '#000' }}>
                    {/* Simulated flow based on session total and time elapsed (mocked) */}
                    <AnimatedCounter value={Math.floor(sessionStats.total / 10) || 0} />
                </strong>
            </Card>
        </div>
    );
};

export default TerminalMetrics;
