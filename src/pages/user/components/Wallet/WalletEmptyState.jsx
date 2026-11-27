import React from 'react';
import Icon from '../../../../components/Icons/Icons';
import styles from '../../UserWallet.module.css';

export default function WalletEmptyState({
  icon = 'ticket',
  title,
  message,
  actionLabel,
  onAction,
}) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIconWrap}>
        <Icon name={icon} size={24} />
      </div>
      {title && <h3 className={styles.emptyTitle}>{title}</h3>}
      <p className={styles.emptyText}>
        {message || 'No hay boletos disponibles en esta categoría.'}
      </p>
      {actionLabel && onAction && (
        <button type="button" className={styles.btnPrimaryPass} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

