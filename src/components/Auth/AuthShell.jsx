import React from 'react';
import Icon from '../Icons/Icons';
import styles from './AuthPages.module.css';

const DEFAULT_PILLARS = [
  {
    icon: 'ticket',
    title: 'Bóveda digital al instante',
    description: 'Tus boletos disponibles desde el momento de la compra en formato Clásico y Coleccionista.',
  },
  {
    icon: 'shieldCheck',
    title: 'Accesos verificados',
    description: 'Validación segura en puerta y control total sobre transferencias y reembolsos.',
  },
  {
    icon: 'calendar',
    title: 'Seguimiento en tiempo real',
    description: 'Recibe alertas de tus próximos eventos y conserva el historial de cada experiencia.',
  },
];

export default function AuthShell({
  title,
  subtitle,
  overlay,
  children,
  footer,
  sideKicker = 'LAIKA Club',
  sideTitle = 'Tu acceso directo a los mejores eventos',
  sideCopy = 'Gestiona boletos, transferencias y compras desde un solo lugar con seguridad de nivel bancario.',
  pillars = DEFAULT_PILLARS,
}) {
  return (
    <div className={styles.authPage}>
      <div className={styles.authShell}>
        <section className={styles.formPanel}>
          {overlay}

          <div className={styles.brandMarkRow}>
            <span className={styles.brandBadge} aria-hidden="true">
              <Icon name="ticket" size={16} />
            </span>
            <span className={styles.brandName}>LAIKA Club</span>
          </div>

          <header className={styles.headerGroup}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </header>

          {children}

          {footer && <div className={styles.footer}>{footer}</div>}
        </section>

        <aside className={styles.brandPanel} aria-label="Información de LAIKA Club">
          <div className={styles.brandGridPattern} aria-hidden="true" />

          <div className={styles.brandPanelTop}>
            <span className={styles.brandKicker}>{sideKicker}</span>
            <h2 className={styles.brandHeadline}>{sideTitle}</h2>
            <p className={styles.brandCopy}>{sideCopy}</p>
          </div>

          <div className={styles.pillarList}>
            {pillars.map((item) => (
              <div key={item.title} className={styles.pillarItem}>
                <span className={styles.pillarIcon} aria-hidden="true">
                  <Icon name={item.icon} size={15} />
                </span>
                <div className={styles.pillarContent}>
                  <span className={styles.pillarTitle}>{item.title}</span>
                  <span className={styles.pillarDesc}>{item.description}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

