import React from 'react';
import Icon from '../../../../components/Icons/Icons';
import { BentoBadge } from '../../../../components/Bento';
import styles from '../../UserWallet.module.css';

export default function IncomingTransfersBanner({
  incomingTransfers,
  loading,
  onAccept,
  onReject,
}) {
  if (!incomingTransfers || incomingTransfers.length === 0) return null;

  return (
    <section className={styles.transfersBanner} aria-label="Transferencias entrantes pendientes">
      <div className={styles.transfersBannerHeader}>
        <div className={styles.transfersBannerTitleRow}>
          <span className={styles.transfersIcon}>
            <Icon name="send" size={16} />
          </span>
          <h2 className={styles.transfersTitle}>
            Transferencias Entrantes Pendientes
          </h2>
        </div>
        <BentoBadge variant="info" dot>
          {incomingTransfers.length} por confirmar
        </BentoBadge>
      </div>

      <div className={styles.transfersList}>
        {incomingTransfers.map((trf) => (
          <div key={trf.id} className={styles.transferItem}>
            <div className={styles.transferInfo}>
              <h3 className={styles.transferEventName}>
                {trf.event_name || 'Evento LAIKA Club'}
              </h3>
              <p className={styles.transferDetail}>
                Remitente: <strong>{trf.sender_email}</strong>
              </p>
              <p className={styles.transferMeta}>
                Zona: {trf.section_name || 'General'} &bull; Expira:{' '}
                {trf.expires_at
                  ? new Date(trf.expires_at).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'}
              </p>
            </div>

            <div className={styles.transferActions}>
              <button
                type="button"
                className={styles.btnAccept}
                onClick={() => onAccept(trf.id)}
                disabled={loading}
              >
                Aceptar Boleto
              </button>
              <button
                type="button"
                className={styles.btnReject}
                onClick={() => onReject(trf.id)}
                disabled={loading}
              >
                Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

