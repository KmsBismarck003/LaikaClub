import React from 'react';
import Icon from '../../../../components/Icons/Icons';
import { BentoBadge } from '../../../../components/Bento';
import styles from '../../UserDashboard.module.css';

export default function DashboardBanner({
  firstName,
  greeting,
  tier,
  upcomingCount,
  cartCount,
  onOpenCart,
  onGoToTickets,
  onExplore,
}) {
  return (
    <header className={styles.welcomeCard}>
      <div className={styles.welcomeGlow} aria-hidden="true" />

      <div className={styles.welcomeMain}>
        <span className={styles.welcomeEyebrow}>{greeting}</span>
        <h1 className={styles.welcomeTitle}>Hola, {firstName}</h1>

        <div className={styles.welcomePills}>
          <BentoBadge variant={tier.variant}>
            <Icon name={tier.icon} size={13} />
            <span>{tier.label}</span>
          </BentoBadge>

          {upcomingCount > 0 && (
            <button
              type="button"
              className={styles.pillButton}
              onClick={onGoToTickets}
            >
              <Icon name="ticket" size={13} />
              <span>
                {upcomingCount === 1
                  ? '1 boleto próximo'
                  : `${upcomingCount} boletos próximos`}
              </span>
            </button>
          )}

          {cartCount > 0 && (
            <button
              type="button"
              className={styles.pillButton}
              onClick={onOpenCart}
            >
              <Icon name="shoppingCart" size={13} />
              <span>{cartCount} en carrito</span>
            </button>
          )}
        </div>
      </div>

      <div className={styles.welcomeActions}>
        <button
          type="button"
          className={styles.secondaryActionBtn}
          onClick={onExplore}
        >
          <Icon name="compass" size={16} />
          <span>Explorar</span>
        </button>

        <button
          type="button"
          className={styles.primaryActionBtn}
          onClick={onGoToTickets}
        >
          <Icon name="ticket" size={16} />
          <span>Mis Boletos</span>
        </button>
      </div>
    </header>
  );
}
