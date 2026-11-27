import React from 'react';
import { Icon } from '../../../../components';
import { PresaleSection } from '../../../../features/presale';
import styles from '../../EventForm.module.css';

const EventPricingSection = ({
  formData,
  onChange,
  onPresaleChange,
}) => {
  return (
    <section className={styles.sectionCard} aria-labelledby="event-pricing-heading">
      <header className={styles.sectionHeader}>
        <div className={styles.sectionHeaderMain}>
          <span className={styles.sectionStepBadge} aria-hidden="true">3</span>
          <div>
            <h3 id="event-pricing-heading" className={styles.sectionTitle}>
              Taquilla y preventa
            </h3>
            <p className={styles.sectionSubtitle}>
              Configura el precio base de entrada, el aforo total y las reglas de preventa exclusiva.
            </p>
          </div>
        </div>
      </header>

      <div className={styles.sectionBody}>
        <div className={styles.gridTwo}>
          <div className={styles.fieldGroup}>
            <label htmlFor="event-price" className={styles.fieldLabel}>
              Precio base (MXN) <span className={styles.requiredMark}>*</span>
            </label>
            <input
              id="event-price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              className={styles.input}
              value={formData.price}
              onChange={onChange}
              placeholder="0.00"
              required
            />
            <span className={styles.fieldHelper}>
              <Icon name="dollarSign" size={12} />
              Deja en 0 para eventos de acceso gratuito.
            </span>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="event-total-tickets" className={styles.fieldLabel}>
              Aforo / Boletos totales <span className={styles.requiredMark}>*</span>
            </label>
            <input
              id="event-total-tickets"
              name="total_tickets"
              type="number"
              min="1"
              step="1"
              className={styles.input}
              value={formData.total_tickets}
              onChange={onChange}
              required
            />
            <span className={styles.fieldHelper}>
              <Icon name="ticket" size={12} />
              Se sincroniza automáticamente al elegir recinto o sala.
            </span>
          </div>
        </div>

        <PresaleSection
          presaleData={{
            presale_enabled: formData.presale_enabled,
            presale_bank_name: formData.presale_bank_name,
            presale_bins: formData.presale_bins,
            presale_start: formData.presale_start,
            presale_end: formData.presale_end,
          }}
          onChange={onPresaleChange}
        />
      </div>
    </section>
  );
};

export default EventPricingSection;

