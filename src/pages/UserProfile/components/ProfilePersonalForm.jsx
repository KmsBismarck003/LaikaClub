import React from 'react';
import Icon from '../../../components/Icons/Icons';
import styles from '../UserProfile.module.css';

export default function ProfilePersonalForm({
  profile,
  isDirty,
  saving,
  savedOk,
  onChange,
  onSave,
  onDiscard,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!saving) onSave();
  };

  return (
    <form className={styles.card} onSubmit={handleSubmit} noValidate>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Información personal</h2>
        <p className={styles.cardDescription}>
          Datos asociados a tus boletos, facturación y contacto para eventos.
        </p>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.fieldRowTwo}>
          <div className={styles.fieldGroup}>
            <label htmlFor="profile-firstName" className={styles.fieldLabel}>
              Nombre
            </label>
            <input
              id="profile-firstName"
              name="firstName"
              type="text"
              value={profile.firstName}
              onChange={onChange}
              placeholder="Tu nombre"
              autoComplete="given-name"
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="profile-lastName" className={styles.fieldLabel}>
              Apellido
            </label>
            <input
              id="profile-lastName"
              name="lastName"
              type="text"
              value={profile.lastName}
              onChange={onChange}
              placeholder="Tu apellido"
              autoComplete="family-name"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="profile-email" className={styles.fieldLabel}>
            Correo electrónico
          </label>
          <div className={styles.inputWrap}>
            <input
              id="profile-email"
              name="email"
              type="email"
              value={profile.email}
              disabled
              className={`${styles.input} ${styles.inputDisabled}`}
            />
            <span className={styles.inputRightIcon} aria-hidden="true">
              <Icon name="lock" size={15} />
            </span>
          </div>
          <span className={styles.fieldHelper}>
            Vinculado a tu cuenta para recibir boletos y accesos. No puede modificarse aquí.
          </span>
        </div>

        <div className={styles.fieldRowTwo}>
          <div className={styles.fieldGroup}>
            <label htmlFor="profile-phone" className={styles.fieldLabel}>
              Teléfono
            </label>
            <input
              id="profile-phone"
              name="phone"
              type="tel"
              value={profile.phone}
              onChange={onChange}
              placeholder="+52 000 000 0000"
              autoComplete="tel"
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="profile-birthDate" className={styles.fieldLabel}>
              Fecha de nacimiento
            </label>
            <input
              id="profile-birthDate"
              name="birthDate"
              type="date"
              value={profile.birthDate}
              onChange={onChange}
              className={styles.input}
            />
          </div>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.statusMessage}>
          {savedOk ? (
            <span className={`${styles.statusMessage} ${styles.statusSuccess}`}>
              <Icon name="checkCircle" size={15} />
              <span>Cambios guardados</span>
            </span>
          ) : isDirty ? (
            <span>Tienes cambios sin guardar</span>
          ) : (
            <span>Información actualizada</span>
          )}
        </div>

        <div className={styles.footerActions}>
          {isDirty && (
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={onDiscard}
              disabled={saving}
            >
              Descartar
            </button>
          )}
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={saving || !isDirty}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </form>
  );
}

