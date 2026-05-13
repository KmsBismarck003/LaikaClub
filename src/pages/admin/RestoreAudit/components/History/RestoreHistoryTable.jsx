import React from 'react';
import { Card, Icon, SkeletonRow } from '../../../../../components';
import { formatDate, formatDuration, severityBadge } from '../../utils/auditHelpers';
import '../../css/History.css';

const RestoreHistoryTable = ({ 
  showSkeleton, 
  events, 
  filters, 
  setFilters, 
  fetchEvents, 
  handleExport, 
  onSelectEvent,
  onNewRestore
}) => {
  return (
    <Card className="glass-panel" style={{ padding: '1.5rem' }}>
      <div className="ra-history-filters">
        <input type="date" value={filters.start_date} onChange={e => setFilters(f => ({ ...f, start_date: e.target.value }))} placeholder="Desde" />
        <input type="date" value={filters.end_date} onChange={e => setFilters(f => ({ ...f, end_date: e.target.value }))} placeholder="Hasta" />
        <select value={filters.environment} onChange={e => setFilters(f => ({ ...f, environment: e.target.value }))}>
          <option value="">Todos los entornos</option>
          <option value="dev">Desarrollo</option>
          <option value="staging">Staging</option>
          <option value="produccion">Producción</option>
        </select>
        <button className="ra-btn ra-btn-secondary" onClick={fetchEvents} style={{ padding: '8px 14px' }}>
          <span><Icon name="search" size={14} className="mr-2" /> Filtrar</span>
        </button>
        <button className="ra-btn ra-btn-secondary" onClick={handleExport} style={{ padding: '8px 14px' }}>
          <span><Icon name="download" size={14} className="mr-2" /> Exportar</span>
        </button>
      </div>

      {showSkeleton ? (
        <div className="ra-table-wrap">
          <table className="ra-table">
            <thead>
              <tr><th>ID</th><th>Fecha</th><th>BD</th><th>Entorno</th><th>Admin</th><th>Duración</th><th>Severidad</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} columns={8} />)}
            </tbody>
          </table>
        </div>
      ) : events.length === 0 ? (
        <div className="ra-empty">
          <div className="icon"><Icon name="fileText" size={48} /></div>
          <p>No hay restauraciones registradas</p>
          <button className="ra-btn ra-btn-primary" onClick={onNewRestore} style={{ marginTop: '1rem' }}>
            <span><Icon name="plus" size={14} className="mr-2" /> Registrar Primera</span>
          </button>
        </div>
      ) : (
        <div className="ra-table-wrap">
          <table className="ra-table">
            <thead>
              <tr><th>ID</th><th>Fecha</th><th>BD</th><th>Entorno</th><th>Admin</th><th>Duración</th><th>Severidad</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id} onClick={() => onSelectEvent(ev.id)} className="ra-table-row">
                  <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>#{ev.id}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDate(ev.created_at)}</td>
                  <td>{ev.database_name}</td>
                  <td><span className="ra-badge ra-badge-info">{(ev.environment || '').toUpperCase()}</span></td>
                  <td>{ev.admin_username}</td>
                  <td>{formatDuration(ev.duration_seconds)}</td>
                  <td>{severityBadge(ev.severity)}</td>
                  <td>
                    {ev.is_confirmed
                      ? <span className="ra-badge ra-badge-success"><Icon name="lock" size={12} className="mr-1" /> Confirmado</span>
                      : <span className="ra-badge ra-badge-warning"><Icon name="clock" size={12} className="mr-1" /> Pendiente</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default RestoreHistoryTable;
