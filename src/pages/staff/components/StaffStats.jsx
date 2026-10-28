import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Activity } from 'lucide-react';
import { BentoCard, BentoMetric } from '../../../components/Bento';
import '../StaffDashboard.css';

/**
 * StaffStats - KPIs Bento del Historial y Bitácora de Accesos.
 */
const StaffStats = ({ history = [] }) => {
  const total = history.length;
  const valid = history.filter(
    (s) => s.status === 'valid' || (s.valid && !s.alreadyUsed) || s.actionable
  ).length;
  const used = history.filter(
    (s) => s.status === 'used' || (s.valid && s.alreadyUsed) || s.statusCode === 'ALREADY_REDEEMED'
  ).length;
  const invalid = history.filter(
    (s) => s.status === 'invalid' || (!s.valid && !s.alreadyUsed) || s.statusCode === 'REVOKED_TICKET'
  ).length;

  const validRate = total > 0 ? Math.round((valid / total) * 100) : 100;

  return (
    <div className="bento-grid staff-history-stats-grid">
      {/* 1. Total Procesados */}
      <BentoCard colSpan={3} className="staff-stat-bento-card">
        <div className="staff-stat-card-header">
          <span className="staff-stat-label">TOTAL ESCANEADOS</span>
          <Activity size={18} className="staff-stat-icon" />
        </div>
        <BentoMetric
          value={total}
          label="Lecturas registradas en turno"
          animate
        />
      </BentoCard>

      {/* 2. Accesos Válidos */}
      <BentoCard colSpan={3} className="staff-stat-bento-card staff-stat-card--success">
        <div className="staff-stat-card-header">
          <span className="staff-stat-label">INGRESOS AUTORIZADOS</span>
          <CheckCircle2 size={18} className="staff-stat-icon success" />
        </div>
        <BentoMetric
          value={valid}
          label={`${validRate}% de efectividad en puerta`}
          trend={total > 0 ? `${validRate}%` : null}
          trendType="positive"
          animate
        />
      </BentoCard>

      {/* 3. Intentos Duplicados */}
      <BentoCard colSpan={3} className="staff-stat-bento-card staff-stat-card--warning">
        <div className="staff-stat-card-header">
          <span className="staff-stat-label">BOLETOS YA USADOS</span>
          <AlertTriangle size={18} className="staff-stat-icon warning" />
        </div>
        <BentoMetric
          value={used}
          label="Intentos de reingreso no permitidos"
          trend={used > 0 ? `${used} duplicados` : null}
          trendType={used > 0 ? 'negative' : 'neutral'}
          animate
        />
      </BentoCard>

      {/* 4. Boletos Inválidos o Revocados */}
      <BentoCard colSpan={3} className="staff-stat-bento-card staff-stat-card--error">
        <div className="staff-stat-card-header">
          <span className="staff-stat-label">ACCESOS RECHAZADOS</span>
          <XCircle size={18} className="staff-stat-icon error" />
        </div>
        <BentoMetric
          value={invalid}
          label="Códigos desconocidos o revocados"
          animate
        />
      </BentoCard>
    </div>
  );
};

export default StaffStats;
