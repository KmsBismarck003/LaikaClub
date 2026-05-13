import React from 'react';
import { Icon, AnimatedCounter, Skeleton } from '../../../../../components';
import '../../css/Stats.css';
import { severityBadge } from '../../utils/auditHelpers';

const RestoreStatsDashboard = ({ stats, showSkeleton }) => {
  if (showSkeleton) {
    return (
      <div className="ra-stats-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="ra-stat-card skeleton" style={{ padding: '20px' }}>
            <Skeleton type="circle" width="32px" height="32px" style={{ marginBottom: '15px' }} />
            <Skeleton type="text" width="60%" height="24px" style={{ marginBottom: '10px' }} />
            <Skeleton type="text" width="40%" height="12px" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return <div className="ra-empty">No hay estadísticas disponibles</div>;

  return (
    <div className="ra-stats-wrapper">
      <div className="ra-stats-grid">
        <div className="ra-stat-card"><div className="stat-icon"><Icon name="chart" size={28} /></div><div className="stat-value"><AnimatedCounter value={stats.total_restorations} /></div><div className="stat-label">Total Restauraciones</div></div>
        <div className="ra-stat-card"><div className="stat-icon"><Icon name="checkCircle" size={28} /></div><div className="stat-value"><AnimatedCounter value={stats.confirmed} /></div><div className="stat-label">Confirmadas</div></div>
        <div className="ra-stat-card"><div className="stat-icon"><Icon name="clock" size={28} /></div><div className="stat-value"><AnimatedCounter value={stats.pending_confirmation} /></div><div className="stat-label">Pendientes</div></div>
        <div className="ra-stat-card"><div className="stat-icon"><Icon name="clock" size={28} /></div><div className="stat-value">{stats.avg_duration_formatted}</div><div className="stat-label">Duración Promedio</div></div>
        <div className="ra-stat-card"><div className="stat-icon"><Icon name="chevronDown" size={28} /></div><div className="stat-value"><AnimatedCounter value={stats.total_downtime_minutes} />m</div><div className="stat-label">Downtime Acumulado</div></div>
        <div className="ra-stat-card"><div className="stat-icon"><Icon name="alertTriangle" size={28} /></div><div className="stat-value"><AnimatedCounter value={stats.error_rate_percent} />%</div><div className="stat-label">Tasa de Errores</div></div>
      </div>

      <div className="ra-dist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div className="ra-detail-section">
          <h3><Icon name="server" className="mr-2" /> Distribución por Entorno</h3>
          <table className="ra-dist-table">
            <thead><tr><th>Entorno</th><th>Cantidad</th></tr></thead>
            <tbody>
              {(stats.by_environment || []).map((r, i) => (
                <tr key={i}><td>{(r.environment || '').toUpperCase()}</td><td>{r.count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ra-detail-section">
          <h3><Icon name="alertTriangle" className="mr-2" /> Por Severidad</h3>
          <table className="ra-dist-table">
            <thead><tr><th>Severidad</th><th>Cantidad</th></tr></thead>
            <tbody>
              {(stats.by_severity || []).map((r, i) => (
                <tr key={i}><td>{severityBadge(r.severity)}</td><td>{r.count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ra-detail-section" style={{ gridColumn: '1 / -1' }}>
          <h3><Icon name="chart" className="mr-2" /> Tendencia Mensual</h3>
          <table className="ra-dist-table">
            <thead><tr><th>Mes</th><th>Restauraciones</th></tr></thead>
            <tbody>
              {(stats.monthly_trend || []).map((r, i) => (
                <tr key={i}><td>{r.month}</td><td>{r.count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RestoreStatsDashboard;
