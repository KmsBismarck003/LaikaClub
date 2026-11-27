import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../../components/Icons/Icons';
import styles from '../../RefundTracker.module.css';

const CONDITIONS = [
  {
    icon: 'check',
    text: 'Cancelación permitida hasta 24 horas antes del inicio del evento.',
  },
  {
    icon: 'dollarSign',
    text: '100% de devolución del valor pagado sin penalización por anticipación.',
  },
  {
    icon: 'creditCard',
    text: 'El abono se realiza automáticamente al método original de pago.',
  },
  {
    icon: 'clock',
    text: 'Procesamiento interbancario estimado de 3 a 5 días hábiles.',
  },
];

export default function RefundPolicyCard() {
  return (
    <aside className={`${styles.surfaceCard} ${styles.policyCard}`} aria-label="Condiciones de reembolso">
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderText}>
          <h2 className={styles.cardTitle}>Condiciones de reembolso</h2>
          <p className={styles.cardSubtitle}>
            Reglas vigentes para devoluciones de boletos.
          </p>
        </div>
      </div>

      <div className={styles.policyList}>
        {CONDITIONS.map((item) => (
          <div key={item.text} className={styles.policyItem}>
            <span className={styles.policyItemIcon} aria-hidden="true">
              <Icon name={item.icon} size={14} />
            </span>
            <p className={styles.policyItemText}>{item.text}</p>
          </div>
        ))}
      </div>

      <div className={styles.policyFootnote}>
        <p className={styles.policyNoteText}>
          Al aprobarse la cancelación, el boleto queda revocado de inmediato en el sistema de accesos.
        </p>
        <Link to="/user/tickets" className={styles.policyLink}>
          <span>Gestionar desde Mis Boletos</span>
          <Icon name="arrowRight" size={14} />
        </Link>
      </div>
    </aside>
  );
}

