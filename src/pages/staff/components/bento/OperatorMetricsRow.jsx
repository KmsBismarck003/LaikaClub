import React from 'react';
import { BentoCard, BentoMetric } from '../../../../components/Bento';
import { CheckCircle2, AlertTriangle, ShieldAlert, Clock, ArrowUpRight } from 'lucide-react';

/**
 * OperatorMetricsRow - Cuadrícula de KPIs Bento de la sesión operativa.
 */
const OperatorMetricsRow = ({ sessionStats }) => {
  return (
    <div className="bento-grid operator-metrics-row">
      {/* 1. Total Procesados */}
      <BentoCard colSpan={3} className="operator-metric-card">
        <div className="operator-metric-card__header">
          <span className="operator-metric-card__label">TOTAL PROCESADOS</span>
          <div className="operator-metric-card__icon">
            <CheckCircle2 size={18} />
          </div>
        </div>
        <BentoMetric
          value={sessionStats.total}
          label="Boletos escaneados hoy"
          animate
        />
      </BentoCard>

      {/* 2. Accesos Válidos */}
      <BentoCard colSpan={3} className="operator-metric-card operator-metric-card--success">
        <div className="operator-metric-card__header">
          <span className="operator-metric-card__label">INGRESOS AUTORIZADOS</span>
          <div className="operator-metric-card__icon success">
            <CheckCircle2 size={18} />
          </div>
        </div>
        <BentoMetric
          value={sessionStats.valids}
          label={`${sessionStats.successRate}% efectividad`}
          trend={sessionStats.total > 0 ? `${sessionStats.successRate}%` : null}
          trendType="positive"
          animate
        />
      </BentoCard>

      {/* 3. Incidencias y Alertas */}
      <BentoCard colSpan={3} className="operator-metric-card operator-metric-card--warning">
        <div className="operator-metric-card__header">
          <span className="operator-metric-card__label">ALERTAS E INCIDENCIAS</span>
          <div className="operator-metric-card__icon warning">
            <AlertTriangle size={18} />
          </div>
        </div>
        <BentoMetric
          value={sessionStats.invalids}
          label="Rechazos o duplicados"
          trend={sessionStats.invalids > 0 ? `${sessionStats.invalids} alertas` : null}
          trendType={sessionStats.invalids > 0 ? 'negative' : 'neutral'}
          animate
        />
      </BentoCard>

      {/* 4. Tiempo Activo de Turno */}
      <BentoCard colSpan={3} className="operator-metric-card">
        <div className="operator-metric-card__header">
          <span className="operator-metric-card__label">TIEMPO EN TURNO</span>
          <div className="operator-metric-card__icon">
            <Clock size={18} />
          </div>
        </div>
        <BentoMetric
          value={sessionStats.hoursActive}
          suffix="h"
          label="Guardia activa en puerta"
          animate
        />
      </BentoCard>
    </div>
  );
};

export default OperatorMetricsRow;
