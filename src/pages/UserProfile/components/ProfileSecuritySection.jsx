import React, { useState } from 'react';
import Icon from '../../../components/Icons/Icons';
import styles from '../UserProfile.module.css';

export default function ProfileSecuritySection({
  changingPassword,
  deletingAccount,
  onChangePassword,
  onRequestDeleteAccount,
  onLogout,
}) {
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    const ok = await onChangePassword(form);
    if (ok) {
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordOpen(false);
    }
  };

  const handleCloseDrawer = () => {
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordOpen(false);
  };

  return (
    <section className={styles.card} aria-label="Seguridad y cuenta">
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Seguridad y acceso</h2>
        <p className={styles.cardDescription}>
          Administra tu contraseña, sesión actual y estado permanente de la cuenta.
        </p>
      </div>

      {/* Fila 1: Contraseña */}
      <div className={styles.settingRow}>
        <div className={styles.settingRowText}>
          <h3 className={styles.settingRowTitle}>Contraseña</h3>
          <p className={styles.settingRowDesc}>
            Usa una contraseña única de al menos 8 caracteres para proteger tus boletos.
          </p>
        </div>

        <button
          type="button"
          className={styles.btnSecondary}
          onClick={() => setPasswordOpen((prev) => !prev)}
        >
          <Icon name="lock" size={15} />
          <span>{passwordOpen ? 'Ocultar' : 'Cambiar contraseña'}</span>
        </button>
      </div>

      {passwordOpen && (
        <div className={styles.passwordDrawer}>
          <form className={styles.passwordForm} onSubmit={handleSubmitPassword} noValidate>
            <div className={styles.fieldGroup}>
              <label htmlFor="sec-currentPassword" className={styles.fieldLabel}>
                Contraseña actual
              </label>
              <div className={styles.inputWrap}>
                <input
                  id="sec-currentPassword"
                  name="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  value={form.currentPassword}
                  onChange={handleInput}
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña actual"
                  className={`${styles.input} ${styles.inputWithToggle}`}
                />
                <button
                  type="button"
                  className={styles.inputToggleBtn}
                  onClick={() => setShowCurrent((v) => !v)}
                  aria-label={showCurrent ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <Icon name={showCurrent ? 'eyeOff' : 'eye'} size={16} />
                </button>
              </div>
            </div>

            <div className={styles.fieldRowTwo}>
              <div className={styles.fieldGroup}>
                <label htmlFor="sec-newPassword" className={styles.fieldLabel}>
                  Nueva contraseña
                </label>
                <div className={styles.inputWrap}>
                  <input
                    id="sec-newPassword"
                    name="newPassword"
                    type={showNew ? 'text' : 'password'}
                    value={form.newPassword}
                    onChange={handleInput}
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    className={`${styles.input} ${styles.inputWithToggle}`}
                  />
                  <button
                    type="button"
                    className={styles.inputToggleBtn}
                    onClick={() => setShowNew((v) => !v)}
                    aria-label={showNew ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'}
                  >
                    <Icon name={showNew ? 'eyeOff' : 'eye'} size={16} />
                  </button>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="sec-confirmPassword" className={styles.fieldLabel}>
                  Confirmar contraseña
                </label>
                <input
                  id="sec-confirmPassword"
                  name="confirmPassword"
                  type={showNew ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleInput}
                  autoComplete="new-password"
                  placeholder="Repite la nueva contraseña"
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.passwordActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={handleCloseDrawer}
                disabled={changingPassword}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={changingPassword}
              >
                {changingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fila 2: Sesión */}
      <div className={styles.settingRow}>
        <div className={styles.settingRowText}>
          <h3 className={styles.settingRowTitle}>Sesión actual</h3>
          <p className={styles.settingRowDesc}>
            Cierra tu sesión en este dispositivo de forma segura.
          </p>
        </div>

        <button
          type="button"
          className={styles.btnSecondary}
          onClick={onLogout}
        >
          <Icon name="logout" size={15} />
          <span>Cerrar sesión</span>
        </button>
      </div>

      {/* Fila 3: Eliminación de cuenta (sobria, sin alarma visual excesiva) */}
      <div className={styles.settingRow}>
        <div className={styles.settingRowText}>
          <h3 className={`${styles.settingRowTitle} ${styles.settingRowTitleDanger}`}>
            Eliminar cuenta
          </h3>
          <p className={styles.settingRowDesc}>
            Elimina permanentemente tu perfil, boletos activos e historial de compras. Esta acción no se puede deshacer.
          </p>
        </div>

        <button
          type="button"
          className={styles.btnDangerOutline}
          onClick={onRequestDeleteAccount}
          disabled={deletingAccount}
        >
          <Icon name="trash2" size={15} />
          <span>{deletingAccount ? 'Eliminando...' : 'Eliminar cuenta'}</span>
        </button>
      </div>
    </section>
  );
}

