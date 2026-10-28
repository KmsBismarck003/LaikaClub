import React, { useState, useEffect } from 'react';
import { BentoGrid } from '../../../components/Bento';
import {
  OperatorHeroCard,
  OperatorActivityFeed,
  OperatorQuickActions,
  OperatorMetricsRow
} from '../components/bento';
import { useOperatorDashboard } from '../hooks/useOperatorDashboard';
import { Shield, Radio } from 'lucide-react';
import '../StaffDashboard.css';

/**
 * StaffTerminalDashboard - Cabina Central Bento Box Tier-1 para Operador de Campo.
 * Vista delgada de orquestación (Capa 1) conforme al estándar Laika.
 */
const StaffTerminalDashboard = () => {
  const {
    user,
    accessPoint,
    setAccessPoint,
    events,
    selectedEventId,
    setSelectedEventId,
    activeEvent,
    sessionStats,
    recentActivity,
    navigateTo
  } = useOperatorDashboard();

  // Animación tipográfica sutil para el identificador del operador
  const [displayText, setDisplayText] = useState('');
  const operatorName = user?.firstName || user?.name || 'Staff';
  const fullText = `Cabina Operativa • ${operatorName}`;

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setDisplayText(fullText.slice(0, index + 1));
      index++;
      if (index >= fullText.length) clearInterval(timer);
    }, 45);
    return () => clearInterval(timer);
  }, [fullText]);

  return (
    <div className="staff-dashboard-page">
      {/* ── Cabecera Superior Semántica ──────────────────────────── */}
      <header className="staff-header">
        <div className="staff-header-content">
          <h1>
            <Shield size={28} className="staff-header-icon" />
            {displayText}
          </h1>
          <p className="staff-subtitle">
            Consola en tiempo real de control de acceso, verificación óptica y servicios de campo
          </p>
        </div>

        <div className="staff-health-info staff-health-info--boxed">
          <div className="staff-health-item">
            <span className="staff-health-label">Canal Operativo</span>
            <div className="staff-health-value">
              <span className="staff-status-dot online" />
              <Radio size={14} className="staff-radio-icon" />
              <span>ONLINE • PUERTA CONECTADA</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Grilla Maestra Bento Box Tier-1 ──────────────────────── */}
      <main className="operator-bento-main">
        {/* Fila 1: Hero Card (col-8) + Live Feed de Accesos (col-4) */}
        <BentoGrid>
          <OperatorHeroCard
            user={user}
            activeEvent={activeEvent}
            events={events}
            selectedEventId={selectedEventId}
            onSelectEvent={setSelectedEventId}
            accessPoint={accessPoint}
            onSelectAccessPoint={setAccessPoint}
            onOpenScanner={() => navigateTo('/staff?tab=scanner')}
            onOpenHelpDesk={() => navigateTo('/staff?tab=helpdesk')}
          />

          <OperatorActivityFeed
            recentActivity={recentActivity}
            onViewFullHistory={() => navigateTo('/staff/history')}
            onOpenScanner={() => navigateTo('/staff?tab=scanner')}
          />
        </BentoGrid>

        {/* Fila 2: Indicadores y Métricas Operativas Bento */}
        <section aria-label="Métricas de la Sesión">
          <OperatorMetricsRow sessionStats={sessionStats} />
        </section>

        {/* Fila 3: Central de Herramientas de Campo */}
        <section aria-label="Herramientas de Campo">
          <OperatorQuickActions onNavigate={navigateTo} />
        </section>
      </main>
    </div>
  );
};

export default StaffTerminalDashboard;
