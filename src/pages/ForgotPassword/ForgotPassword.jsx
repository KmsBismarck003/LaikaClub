import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Icon from '../../components/Icons/Icons';
import AuthShell from '../../components/Auth/AuthShell';
import styles from '../../components/Auth/AuthPages.module.css';

const RECOVERY_PILLARS = [
  {
    icon: 'mail',
    title: 'Código directo a tu correo',
    description: 'Enviamos un código numérico de 6 dígitos únicamente al correo registrado en tu cuenta.',
  },
  {
    icon: 'clock',
    title: 'Vigencia de 15 minutos',
    description: 'Cada código es de un solo uso y expira automáticamente para proteger tu acceso.',
  },
  {
    icon: 'shieldCheck',
    title: 'Restablecimiento seguro',
    description: 'Al actualizar tu contraseña se limpian los bloqueos previos y se protege tu historial.',
  },
];

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword, resetPassword } = useAuth();
  const { success, error: showError } = useNotification();

  const [step, setStep] = useState('request'); // 'request' | 'reset'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'code' ? value.replace(/\D/g, '').slice(0, 6) : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateRequestStep = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Ingresa el correo registrado en tu cuenta';
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = 'El formato del correo no es válido';
    }
    return newErrors;
  };

  const validateResetStep = () => {
    const newErrors = {};
    if (!formData.code) {
      newErrors.code = 'Ingresa el código de verificación';
    } else if (!/^\d{6}$/.test(formData.code)) {
      newErrors.code = 'El código debe tener exactamente 6 dígitos';
    }
    if (!formData.newPassword) {
      newErrors.newPassword = 'Ingresa tu nueva contraseña';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    return newErrors;
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    const newErrors = validateRequestStep();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await forgotPassword(formData.email.trim());
      if (result.success) {
        success(
          result.message ||
            'Si el correo está registrado, enviamos un código de verificación de 6 dígitos.'
        );
        setStep('reset');
      } else {
        showError(result.error || 'No pudimos procesar la solicitud. Intenta de nuevo.');
      }
    } catch {
      showError('Error de conexión al solicitar el código.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const newErrors = validateResetStep();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword({
        email: formData.email.trim(),
        code: formData.code.trim(),
        password: formData.newPassword,
      });

      if (result.success) {
        success('Contraseña actualizada correctamente. Ya puedes iniciar sesión.');
        navigate('/login');
      } else {
        showError(result.error || 'El código es incorrecto o ha expirado.');
      }
    } catch {
      showError('Error de conexión al actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={step === 'request' ? 'Recupera tu contraseña' : 'Verifica tu código'}
      subtitle={
        step === 'request'
          ? 'Ingresa tu correo registrado y te enviaremos un número de verificación de 6 dígitos.'
          : `Ingresa el código enviado a ${formData.email} y define tu nueva contraseña.`
      }
      sideKicker="Seguridad de cuenta"
      sideTitle="Recupera tu acceso en dos pasos"
      sideCopy="Protegemos tu cuenta mediante verificación temporal por correo electrónico."
      pillars={RECOVERY_PILLARS}
      footer={
        <Link to="/login" className={styles.backLink}>
          <Icon name="arrowLeft" size={15} />
          <span>Volver a iniciar sesión</span>
        </Link>
      }
    >
      <div className={styles.stepper} aria-label="Progreso de recuperación">
        <span className={`${styles.stepBar} ${styles.stepBarActive}`} />
        <span className={`${styles.stepBar} ${step === 'reset' ? styles.stepBarActive : ''}`} />
      </div>

      {step === 'request' ? (
        <form onSubmit={handleRequestCode} className={styles.form} noValidate>
          <div className={styles.fieldGroup}>
            <label htmlFor="forgot-email" className={styles.fieldLabel}>
              Correo registrado
            </label>
            <input
              id="forgot-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@correo.com"
              autoComplete="email"
              disabled={loading}
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              required
            />
            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            <Icon name="mail" size={16} />
            <span>{loading ? 'Enviando código...' : 'Enviar código de verificación'}</span>
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className={styles.form} noValidate>
          <div className={styles.fieldGroup}>
            <label htmlFor="reset-code" className={styles.fieldLabel}>
              Código de 6 dígitos
            </label>
            <input
              id="reset-code"
              type="text"
              inputMode="numeric"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="000000"
              maxLength={6}
              autoComplete="one-time-code"
              disabled={loading}
              className={`${styles.input} ${styles.inputCode} ${errors.code ? styles.inputError : ''}`}
              required
            />
            {errors.code && <span className={styles.fieldError}>{errors.code}</span>}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="reset-password" className={styles.fieldLabel}>
              Nueva contraseña
            </label>
            <div className={styles.inputWrap}>
              <input
                id="reset-password"
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                disabled={loading}
                className={`${styles.input} ${styles.inputWithIcon} ${errors.newPassword ? styles.inputError : ''}`}
                required
              />
              <button
                type="button"
                className={styles.eyeToggle}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <Icon name={showPassword ? 'eyeOff' : 'eye'} size={17} />
              </button>
            </div>
            {errors.newPassword && (
              <span className={styles.fieldError}>{errors.newPassword}</span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="reset-confirm" className={styles.fieldLabel}>
              Confirmar nueva contraseña
            </label>
            <input
              id="reset-confirm"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu nueva contraseña"
              autoComplete="new-password"
              disabled={loading}
              className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
              required
            />
            {errors.confirmPassword && (
              <span className={styles.fieldError}>{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            <Icon name="lock" size={16} />
            <span>{loading ? 'Actualizando contraseña...' : 'Restablecer contraseña'}</span>
          </button>

          <div className={styles.optionsRow}>
            <button
              type="button"
              className={styles.inlineLink}
              onClick={() => setStep('request')}
              disabled={loading}
            >
              Cambiar correo
            </button>
            <button
              type="button"
              className={styles.inlineLink}
              onClick={handleRequestCode}
              disabled={loading}
            >
              Reenviar código
            </button>
          </div>
        </form>
      )}
    </AuthShell>
  );
};

export default ForgotPassword;
