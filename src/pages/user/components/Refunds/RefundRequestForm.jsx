import React from 'react';
import Icon from '../../../../components/Icons/Icons';
import { REFUND_REASONS } from '../../hooks/useRefundTracker';
import styles from '../../RefundTracker.module.css';

export default function RefundRequestForm({
  eligibleTickets,
  form,
  quote,
  quoteLoading,
  submitting,
  onChangeField,
  onSubmit,
  onClose,
}) {
  const isBlockedByQuote = Boolean(quote && !quote.eligible);

  return (
    <form className={styles.surfaceCard} onSubmit={onSubmit} noValidate>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderText}>
          <h2 className={styles.cardTitle}>Nueva solicitud de cancelación</h2>
          <p className={styles.cardSubtitle}>
            Selecciona un boleto activo para consultar tu cotización en tiempo real.
          </p>
        </div>

        <button
          type="button"
          className={styles.closeIconBtn}
          onClick={onClose}
          aria-label="Cerrar formulario"
        >
          <Icon name="close" size={16} />
        </button>
      </div>

      <div className={styles.formBody}>
        <div className={styles.fieldGroup}>
          <label htmlFor="refund-ticket" className={styles.fieldLabel}>
            Boleto a cancelar
          </label>
          <select
            id="refund-ticket"
            className={styles.selectInput}
            value={form.ticketId}
            onChange={(e) => onChangeField('ticketId', e.target.value)}
            required
          >
            <option value="">Selecciona un boleto...</option>
            {eligibleTickets.map((t, i) => (
              <option key={t.id || i} value={t.id || i}>
                {t.event?.name || t.eventName || `Boleto #${t.id}`} —{' '}
                {t.ticket_code || t.ticketCode} ($
                {Number(t.price || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })})
              </option>
            ))}
            {eligibleTickets.length === 0 && (
              <option value="" disabled>
                No tienes boletos activos elegibles para cancelar
              </option>
            )}
          </select>
        </div>

        {quoteLoading && (
          <div className={styles.quoteLoading}>
            <Icon name="clock" size={15} />
            <span>Consultando cotización de reembolso...</span>
          </div>
        )}

        {quote && !quoteLoading && (
          quote.eligible ? (
            <div className={styles.quoteEligible}>
              <div className={styles.quoteTopRow}>
                <span className={styles.quoteLabel}>Importe a devolver</span>
                <span className={styles.quoteAmount}>
                  ${Number(quote.refundAmount || 0).toLocaleString('es-MX', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  MXN
                </span>
              </div>
              <div className={styles.quoteMeta}>
                <span>Método: {quote.paymentMethod || 'Método original'}</span>
                <span>Plazo estimado: {quote.estimatedDays || '3 a 5 días hábiles'}</span>
              </div>
            </div>
          ) : (
            <div className={styles.quoteRejected}>
              <Icon name="alertCircle" size={16} />
              <span>
                {quote.rejectionReason ||
                  'Este boleto no cumple con las condiciones de cancelación.'}
              </span>
            </div>
          )
        )}

        <div className={styles.fieldGroup}>
          <label htmlFor="refund-reason" className={styles.fieldLabel}>
            Motivo
          </label>
          <select
            id="refund-reason"
            className={styles.selectInput}
            value={form.reason}
            onChange={(e) => onChangeField('reason', e.target.value)}
            required
          >
            <option value="">Selecciona un motivo...</option>
            {REFUND_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="refund-detail" className={styles.fieldLabel}>
            Detalle adicional (opcional)
          </label>
          <textarea
            id="refund-detail"
            className={styles.textareaInput}
            value={form.detail}
            onChange={(e) => onChangeField('detail', e.target.value)}
            placeholder="Describe brevemente tu situación..."
            rows={3}
          />
        </div>
      </div>

      <div className={styles.formFooter}>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={onClose}
          disabled={submitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className={styles.btnPrimary}
          disabled={submitting || isBlockedByQuote}
        >
          {submitting ? 'Enviando solicitud...' : 'Enviar solicitud'}
        </button>
      </div>
    </form>
  );
}

