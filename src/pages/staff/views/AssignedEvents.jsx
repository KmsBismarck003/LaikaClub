import React from 'react';
import { Calendar } from 'lucide-react';
import '../StaffDashboard.css';

const AssignedEvents = () => {
    return (
        <div className="staff-dashboard-page">
            <header className="staff-header">
                <div className="staff-header-content">
                    <h1>
                        <Calendar size={28} color="var(--staff-accent-primary)" />
                        Mis Asignaciones de Campo
                    </h1>
                    <p className="staff-subtitle">Recintos y eventos en los que estás asignado como operador oficial o especialista en puerta</p>
                </div>
            </header>
            
            <section aria-label="Listado de Turnos">
                <div className="staff-empty-state" style={{ padding: '6rem 2rem' }}>
                    <Calendar size={48} style={{ color: 'var(--staff-text-muted)', margin: '0 auto 1.5rem', opacity: 0.4 }} />
                    <h3 className="staff-empty-title">Sin Asignaciones Pendientes Hoy</h3>
                    <p className="staff-empty-desc">
                        Actualmente tu usuario no registra turnos de verificación en puertas o taquilla programados dentro de las próximas 48 horas.
                        Tan pronto un Administrador o Gestor de Sede confirme tu horario y puerta de acceso, se activará el enlace directo en esta central.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default AssignedEvents;
