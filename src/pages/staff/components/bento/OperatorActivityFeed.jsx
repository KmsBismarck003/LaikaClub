import React from 'react';
import { BentoCard, BentoHeader, BentoBadge } from '../../../../components/Bento';
import { History, ArrowRight, User, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

/**
 * OperatorActivityFeed - Feed visual compacto de las últimas validaciones de acceso.
 */
const OperatorActivityFeed = ({
  recentActivity = [],
  onViewFullHistory,
  onOpenScanner
}) => {
  const getStatusBadge = (item) => {
    if (item.actionable || (item.valid && !item.alreadyUsed) || item.status === 'valid') {
      return (
        <BentoBadge variant="success" size="sm">
          <CheckCircle2 size={12} /> Válido
        </BentoBadge>
      );
    }
    if (item.alreadyUsed || item.status === 'used' || item.statusCode === 'ALREADY_REDEEMED') {
      return (
        <BentoBadge variant="warning" size="sm">
          <AlertTriangle size={12} /> Usado
        </BentoBadge>
      );
    }
    return (
      <BentoBadge variant="error" size="sm">
        <XCircle size={12} /> Denegado
      </BentoBadge>
    );
  };

  const formatScanTime = (timestamp) => {
    if (!timestamp) return 'Reciente';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Reciente';
    }
  };

  return (
    <BentoCard
      colSpan={4}
      className="operator-feed-card"
      header={
        <BentoHeader
          title="Monitoreo de Acceso"
          subtitle="Últimos boletos verificados en puerta"
          icon={<History size={18} />}
          action={
            <button
              type="button"
              className="operator-feed__history-link"
              onClick={onViewFullHistory}
              title="Abrir historial completo"
            >
              <span>Ver bitácora</span>
              <ArrowRight size={14} />
            </button>
          }
        />
      }
    >
      <div className="operator-feed__content">
        {recentActivity.length === 0 ? (
          <div className="operator-feed__empty">
            <History size={32} className="operator-feed__empty-icon" />
            <p className="operator-feed__empty-text">Sin lecturas en esta sesión</p>
            <button
              type="button"
              className="operator-feed__start-btn"
              onClick={onOpenScanner}
            >
              Iniciar primer escaneo
            </button>
          </div>
        ) : (
          <ul className="operator-feed__list">
            {recentActivity.map((scan, index) => (
              <li key={scan.ticketId || scan.ticketCode || index} className="operator-feed__item">
                <div className="operator-feed__item-main">
                  <div className="operator-feed__item-avatar">
                    <User size={14} />
                  </div>
                  <div className="operator-feed__item-info">
                    <span className="operator-feed__item-name">
                      {scan.customerName || scan.name || 'Asistente General'}
                    </span>
                    <span className="operator-feed__item-meta">
                      {scan.ticketType || scan.sectionName || 'General'} • {formatScanTime(scan.scannedAt)}
                    </span>
                  </div>
                </div>
                <div className="operator-feed__item-status">
                  {getStatusBadge(scan)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </BentoCard>
  );
};

export default OperatorActivityFeed;
