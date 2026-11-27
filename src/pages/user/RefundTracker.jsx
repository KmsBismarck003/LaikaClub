import React from 'react';
import { Link } from 'react-router-dom';
import { BentoGrid, BentoCard, BentoMetric, BentoBadge } from '../../components/Bento';
import Icon from '../../components/Icons/Icons';
import useRefundTracker from './hooks/useRefundTracker';
import RefundRequestForm from './components/Refunds/RefundRequestForm';
import RefundHistoryList from './components/Refunds/RefundHistoryList';
import RefundPolicyCard from './components/Refunds/RefundPolicyCard';
import styles from './RefundTracker.module.css';

export default function RefundTracker() {
  const {
    requests,
    filteredRequests,
    eligibleTickets,
    loading,
    loadError,
    showForm,
    setShowForm,
    closeForm,
    submitting,
    statusFilter,
    setStatusFilter,
    countsByFilter,
    form,
    updateFormField,
    quote,
    quoteLoading,
    pendingCount,
    totalInProcess,
    totalRefunded,
    handleSubmit,
    reload,
  } = useRefundTracker();

  if (loading) {
    return (
      <div className={styles.refundsPage}>
        <div className={styles.skeletonStack}>
          <div className={styles.skeletonBox} style={{ height: '120px' }} />
          <div className={styles.skeletonBox} style={{ height: '240px' }} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.refundsPage}>
      {/* ── Cabecera principal ──────────────────────────────────── */}
      <header className={styles.pageHeader}>
        <div className={styles.headerText}>
          <h1 className={styles.pageTitle}>Reembolsos y cancelaciones</h1>
          <p className={styles.pageSubtitle}>
            Consulta el estado de tus devoluciones y solicita cancelaciones de boletos activos.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link to="/user/tickets" className={styles.btnSecondary}>
            <Icon name="ticket" size={15} />
            <span>Mis Boletos</span>
          </Link>

          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => setShowForm((prev) => !prev)}
          >
            <Icon name={showForm ? 'close' : 'plus'} size={15} />
            <span>{showForm ? 'Cerrar solicitud' : 'Nueva solicitud'}</span>
          </button>
        </div>
      </header>

      {/* ── Resumen financiero Bento (datos reales) ─────────────── */}
      <BentoGrid>
        <BentoCard colSpan={4}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiIcon}>
              <Icon name="clock" size={16} />
            </span>
            <BentoBadge variant={pendingCount > 0 ? 'warning' : 'neutral'} dot={pendingCount > 0}>
              {pendingCount > 0 ? 'Activas' : 'Al día'}
            </BentoBadge>
          </div>
          <BentoMetric value={pendingCount} label="Solicitudes pendientes" animate={false} />
          <span className={styles.kpiSub}>En revisión o dispersión bancaria</span>
        </BentoCard>

        <BentoCard colSpan={4}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiIcon}>
              <Icon name="creditCard" size={16} />
            </span>
            <BentoBadge variant="info">En trámite</BentoBadge>
          </div>
          <BentoMetric
            value={`$${totalInProcess.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
            label="Monto en proceso"
            animate={false}
          />
          <span className={styles.kpiSub}>MXN pendientes de abono</span>
        </BentoCard>

        <BentoCard colSpan={4}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiIcon}>
              <Icon name="checkCircle" size={16} />
            </span>
            <BentoBadge variant="success">Completado</BentoBadge>
          </div>
          <BentoMetric
            value={`$${totalRefunded.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
            label="Total reembolsado"
            animate={false}
          />
          <span className={styles.kpiSub}>MXN devueltos a tu cuenta</span>
        </BentoCard>
      </BentoGrid>

      {/* ── Estado de error de red ──────────────────────────────── */}
      {loadError && (
        <div className={`${styles.surfaceCard} ${styles.emptyBox}`}>
          <span className={styles.emptyIcon}>
            <Icon name="alertTriangle" size={24} />
          </span>
          <h3 className={styles.emptyTitle}>No pudimos cargar tus reembolsos</h3>
          <p className={styles.emptyText}>{loadError}</p>
          <button type="button" className={styles.btnPrimary} onClick={reload}>
            <Icon name="refresh" size={15} />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      {/* ── Workspace de 2 columnas: Solicitudes + Condiciones ──── */}
      {!loadError && (
        <div className={styles.workspaceGrid}>
          <div className={styles.mainColumn}>
            {showForm && (
              <RefundRequestForm
                eligibleTickets={eligibleTickets}
                form={form}
                quote={quote}
                quoteLoading={quoteLoading}
                submitting={submitting}
                onChangeField={updateFormField}
                onSubmit={handleSubmit}
                onClose={closeForm}
              />
            )}

            <RefundHistoryList
              requests={filteredRequests}
              totalCount={requests.length}
              statusFilter={statusFilter}
              countsByFilter={countsByFilter}
              hasEligibleTickets={eligibleTickets.length > 0}
              onSelectFilter={setStatusFilter}
              onOpenNewRequest={() => setShowForm(true)}
            />
          </div>

          <RefundPolicyCard />
        </div>
      )}
    </div>
  );
}
