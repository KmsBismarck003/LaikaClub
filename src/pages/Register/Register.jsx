import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Alert } from '../../components';
import Icon from '../../components/Icons/Icons';
import AuthShell from '../../components/Auth/AuthShell';
import { transferAPI } from '../../services/transfer.service';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import styles from '../../components/Auth/AuthPages.module.css';

const roleRedirectMap = {
  admin: '/admin',
  gestor: '/events/manage',
  operador: '/staff/dashboard',
  usuario: '/user/dashboard',
};

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || null;
  const { loginGoogle, register: authRegister } = useAuth();
  const { error: showError, success: showSuccess } = useNotification();

  const searchParams = new URLSearchParams(location.search);
  const claimToken = searchParams.get('claim_token');
  const urlEmail = searchParams.get('email');

  const [formData, setFormData] = useState({
    email: urlEmail ? decodeURIComponent(urlEmail).trim() : '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [claimInfo, setClaimInfo] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (claimToken) {
      transferAPI
        .getClaimInfo(claimToken)
        .then((info) => {
          setClaimInfo(info);
          if (info.recipient_email && !formData.email) {
            setFormData((prev) => ({ ...prev, email: info.recipient_email }));
          }
        })
        .catch((err) => {
          console.warn('No se pudo cargar la información del boleto reservado', err);
        });
    }
  }, [claimToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo válido';
    }
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Debe tener al menos 8 caracteres';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    return newErrors;
  };

  const handlePostRegistrationClaim = async () => {
    if (!claimToken) return false;
    try {
      await transferAPI.claimByToken(claimToken);
      showSuccess('Boleto transferido y guardado en tu bóveda.');
      return true;
    } catch (err) {
      console.warn('Error al auto-reclamar el boleto tras registrarse:', err);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setAlert(null);
    try {
      const result = await authRegister({
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        const claimed = await handlePostRegistrationClaim();
        setAlert({
          type: 'success',
          message: claimed
            ? 'Cuenta creada con éxito. Tu boleto ya está guardado en Mis Boletos.'
            : 'Cuenta creada con éxito. Redirigiendo...',
        });
        setTimeout(() => navigate(claimed ? '/user/tickets' : from || '/user/tickets'), 1200);
      } else {
        setAlert({ type: 'error', message: result.error || 'Error en el registro' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Error en el registro' });
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const result = await loginGoogle(tokenResponse.credential || tokenResponse.access_token);
        if (result.success) {
          const claimed = await handlePostRegistrationClaim();
          if (claimed) {
            navigate('/user/tickets');
          } else {
            navigate(from || roleRedirectMap[result.user.role] || '/');
          }
        } else {
          showError(result.error || 'Error con Google');
        }
      } catch {
        showError('Error en autenticación con Google');
      } finally {
        setLoading(false);
      }
    },
    onError: () => showError('Error al conectar con Google'),
    flow: 'implicit',
  });

  const hasMinLength = formData.password.length >= 8;
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasDigit = /\d/.test(formData.password);
  const strengthPct = ([hasMinLength, hasUpper, hasDigit].filter(Boolean).length / 3) * 100;

  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle="Regístrate en segundos para comprar, transferir y guardar tus boletos."
      sideKicker="Registro rápido"
      sideTitle="Todo listo para tu próximo evento"
      sideCopy="Una sola cuenta para administrar tus accesos digitales, recibir cortesías y seguir tus compras."
      footer={
        <>
          <span>¿Ya tienes cuenta?</span>
          <Link to="/login" className={styles.footerLink}>
            Iniciar sesión
          </Link>
        </>
      }
    >
      {claimInfo && (
        <div className={styles.claimBanner}>
          <span className={styles.claimIcon}>
            <Icon name="ticket" size={20} />
          </span>
          <div className={styles.claimText}>
            <span className={styles.claimTitle}>
              Boleto reservado: {claimInfo.event_name}
            </span>
            <span>
              {claimInfo.sender_name} te envió un boleto. Completa tu registro para acreditarlo automáticamente.
            </span>
          </div>
        </div>
      )}

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          closable
          onClose={() => setAlert(null)}
        />
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.fieldGroup}>
          <label htmlFor="register-email" className={styles.fieldLabel}>
            Correo electrónico
          </label>
          <input
            id="register-email"
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

        <div className={styles.fieldGroup}>
          <label htmlFor="register-password" className={styles.fieldLabel}>
            Contraseña
          </label>
          <div className={styles.inputWrap}>
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              disabled={loading}
              className={`${styles.input} ${styles.inputWithIcon} ${errors.password ? styles.inputError : ''}`}
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
          {errors.password && <span className={styles.fieldError}>{errors.password}</span>}

          <div className={styles.strengthWrap}>
            <div className={styles.strengthTrack}>
              <div className={styles.strengthFill} style={{ width: `${strengthPct}%` }} />
            </div>
            <div className={styles.strengthReqs}>
              <span
                className={`${styles.strengthReqItem} ${hasMinLength ? styles.strengthReqValid : ''}`}
              >
                <Icon name="check" size={12} />
                <span>8+ caracteres</span>
              </span>
              <span
                className={`${styles.strengthReqItem} ${hasUpper ? styles.strengthReqValid : ''}`}
              >
                <Icon name="check" size={12} />
                <span>Mayúscula</span>
              </span>
              <span
                className={`${styles.strengthReqItem} ${hasDigit ? styles.strengthReqValid : ''}`}
              >
                <Icon name="check" size={12} />
                <span>Número</span>
              </span>
            </div>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="register-confirm" className={styles.fieldLabel}>
            Confirmar contraseña
          </label>
          <input
            id="register-confirm"
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Repite tu contraseña"
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
          <span>{loading ? 'Creando cuenta...' : 'Crear cuenta'}</span>
          {!loading && <Icon name="arrowRight" size={16} />}
        </button>
      </form>

      <div className={styles.divider}>O continúa con</div>

      <button
        type="button"
        className={styles.googleBtn}
        onClick={() => googleLogin()}
        disabled={loading}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>Continuar con Google</span>
      </button>
    </AuthShell>
  );
};

export default Register;
