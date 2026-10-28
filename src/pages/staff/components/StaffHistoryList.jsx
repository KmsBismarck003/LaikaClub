import React, { useState, useMemo } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock, Search, Filter, Hash, User, Calendar } from 'lucide-react';
import { BentoCard, BentoHeader, BentoBadge } from '../../../components/Bento';
import '../StaffDashboard.css';

/**
 * StaffHistoryList - Bitácora de Registro de Accesos Bento Box.
 * Ofrece búsqueda en tiempo real por código o asistente y filtrado por estado.
 */
const StaffHistoryList = ({ history = [] }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'valid', 'used', 'invalid'

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // 1. Filtro por estado
      if (filter === 'valid') {
        const isValid = item.status === 'valid' || (item.valid && !item.alreadyUsed) || item.actionable;
        if (!isValid) return false;
      } else if (filter === 'used') {
        const isUsed = item.status === 'used' || (item.valid && item.alreadyUsed) || item.statusCode === 'ALREADY_REDEEMED';
        if (!isUsed) return false;
      } else if (filter === 'invalid') {
        const isInvalid = item.status === 'invalid' || (!item.valid && !item.alreadyUsed) || item.statusCode === 'REVOKED_TICKET';
        if (!isInvalid) return false;
      }

      // 2. Filtro por texto de búsqueda
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const code = (item.ticketCode || '').toLowerCase();
        const name = (item.customerName || item.name || '').toLowerCase();
        const event = (item.eventName || '').toLowerCase();
        return code.includes(q) || name.includes(q) || event.includes(q);
      }

      return true;
    });
  }, [history, filter, search]);

  const getStatusBadge = (item) => {
    if (item.actionable || (item.valid && !item.alreadyUsed) || item.status === 'valid') {
      return (
        <BentoBadge variant="success">
          <CheckCircle2 size={12} /> ACCESO VÁLIDO
        </BentoBadge>
      );
    }
    if (item.alreadyUsed || item.status === 'used' || item.statusCode === 'ALREADY_REDEEMED') {
      return (
        <BentoBadge variant="warning">
          <AlertTriangle size={12} /> YA CANJEADO
        </BentoBadge>
      );
    }
    return (
      <BentoBadge variant="error">
        <XCircle size={12} /> RECHAZADO
      </BentoBadge>
    );
  };

  const getStatusIcon = (item) => {
    if (item.actionable || (item.valid && !item.alreadyUsed) || item.status === 'valid') {
      return <CheckCircle2 size={20} className="staff-history-icon-status success" />;
    }
    if (item.alreadyUsed || item.status === 'used' || item.statusCode === 'ALREADY_REDEEMED') {
      return <AlertTriangle size={20} className="staff-history-icon-status warning" />;
    }
    return <XCircle size={20} className="staff-history-icon-status error" />;
  };

  return (
    <BentoCard
      colSpan={12}
      className="staff-history-card-bento"
      header={
        <BentoHeader
          title="Registro Cronológico de Accesos"
          subtitle="Historial auditado de verificaciones en esta estación de trabajo"
          icon={<Clock size={20} />}
          action={
            <span className="staff-history-counter-pill">
              {filteredHistory.length} de {history.length} registros
            </span>
          }
        />
      }
    >
      {/* ── Barra de Filtros y Búsqueda ─────────────────────────────── */}
      <div className="staff-history-filter-bar">
        <div className="staff-history-search-wrap">
          <Search size={16} className="staff-history-search-icon" />
          <input
            type="text"
            className="staff-history-search-input"
            placeholder="Filtrar por código de boleto, asistente o evento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="staff-history-filter-chips">
          <button
            type="button"
            className={`staff-filter-chip ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todos ({history.length})
          </button>
          <button
            type="button"
            className={`staff-filter-chip ${filter === 'valid' ? 'active' : ''}`}
            onClick={() => setFilter('valid')}
          >
            Válidos
          </button>
          <button
            type="button"
            className={`staff-filter-chip ${filter === 'used' ? 'active' : ''}`}
            onClick={() => setFilter('used')}
          >
            Duplicados
          </button>
          <button
            type="button"
            className={`staff-filter-chip ${filter === 'invalid' ? 'active' : ''}`}
            onClick={() => setFilter('invalid')}
          >
            Rechazados
          </button>
        </div>
      </div>

      {/* ── Listado Bento de Verificaciones ─────────────────────────── */}
      <div className="staff-history-list-wrap">
        {filteredHistory.length === 0 ? (
          <div className="staff-history-empty-bento">
            <Clock size={36} className="staff-history-empty-icon" />
            <h4 className="staff-history-empty-title">Sin registros que coincidan</h4>
            <p className="staff-history-empty-desc">
              {history.length === 0
                ? 'Aún no se han verificado boletos en esta sesión de trabajo. Los escaneos realizados en la terminal se registrarán aquí automáticamente.'
                : 'No se encontraron accesos con los filtros o términos de búsqueda ingresados.'}
            </p>
          </div>
        ) : (
          <div className="staff-history-items-grid">
            {filteredHistory.map((scan, index) => (
              <div key={scan.ticketId || scan.ticketCode || index} className="staff-history-row-bento">
                <div className="staff-history-row-main">
                  <div className="staff-history-status-indicator">
                    {getStatusIcon(scan)}
                  </div>
                  <div className="staff-history-row-info">
                    <div className="staff-history-primary-row">
                      <span className="staff-history-customer-name">
                        {scan.customerName || scan.name || 'Asistente Registrado'}
                      </span>
                      <code className="staff-history-code-badge">
                        <Hash size={12} /> {scan.ticketCode || 'CÓDIGO NO LEGIBLE'}
                      </code>
                    </div>
                    <div className="staff-history-secondary-row">
                      <span className="staff-history-meta-event">
                        <Calendar size={13} /> {scan.eventName || 'Evento LAIKA Club'}
                      </span>
                      <span className="staff-history-meta-section">
                        {scan.ticketType || scan.sectionName || 'General'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="staff-history-row-actions">
                  <div className="staff-history-time-stamp">
                    <Clock size={13} />
                    <span>
                      {scan.scannedAt
                        ? new Date(scan.scannedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })
                        : 'Reciente'}
                    </span>
                  </div>
                  {getStatusBadge(scan)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BentoCard>
  );
};

export default StaffHistoryList;
