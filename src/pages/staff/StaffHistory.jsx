import React, { useState, useEffect } from 'react';
import StaffHistoryList from './components/StaffHistoryList';
import StaffStats from './components/StaffStats';
import { History, ShieldCheck } from 'lucide-react';
import { BentoBadge } from '../../components/Bento';
import './StaffDashboard.css';

/**
 * StaffHistory - Vista principal de Registro de Accesos (Capa 1).
 * Orquesta las métricas de sesión y la bitácora cronológica auditada.
 */
const StaffHistory = () => {
  const [scanHistory, setScanHistory] = useState([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('staff_scan_history');
    if (savedHistory) {
      try {
        setScanHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error al parsear el historial de escaneo:', e);
      }
    }
  }, []);

  return (
    <div className="staff-dashboard-page">
      {/* ── Cabecera de la Vista ───────────────────────────────────── */}
      <header className="staff-header">
        <div className="staff-header-content">
          <h1>
            <History size={28} className="staff-header-icon" />
            Registro de Accesos • Bitácora de Turno
          </h1>
          <p className="staff-subtitle">
            Auditoría en tiempo real de todos los boletos y acreditaciones verificadas durante la sesión activa
          </p>
        </div>

        <div className="staff-header-actions">
          <BentoBadge variant="success" dot>
            AUDITORÍA EN VIVO
          </BentoBadge>
        </div>
      </header>

      {/* ── Métricas Bento de Rendimiento en Acceso ────────────────── */}
      <section aria-label="Resumen Estadístico">
        <StaffStats history={scanHistory} />
      </section>

      {/* ── Bitácora Completa con Búsqueda y Filtros ───────────────── */}
      <section aria-label="Listado de Verificaciones" className="staff-history-section-wrapper">
        <StaffHistoryList history={scanHistory} />
      </section>
    </div>
  );
};

export default StaffHistory;
