import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { LockoutOverlay, LoadingScreen } from '../../components';
import Icon from '../../components/Icons/Icons';
import AuthShell from '../../components/Auth/AuthShell';
import styles from '../../components/Auth/AuthPages.module.css';

// Mapa de redirección por rol (inline para evitar dependencia circular con routes.js)
const roleRedirectMap = {
  admin: '/admin',
  gestor: '/events/manage',
  operador: '/staff/dashboard',
  usuario: '/user/dashboard',
};

// Mapa de puertos para aplicaciones desacopladas
const DECOUPLED_PORTS = {
  admin: 3010,
  gestor: 3020,
  operador: 3030,
};

const pingPort = async (port, timeoutMs = 300) => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    await fetch(`http://localhost:${port}/favicon.ico`, {
      mode: 'no-cors',
      signal: controller.signal,
    });
    clearTimeout(timer);
    return true;
  } catch {
    return false;
  }
};

const handleRoleRedirection = async (userObj, navigate, from = null) => {
  const userRole = userObj?.role;
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.endsWith('.local'));

  if (isLocalhost) {
    const targetPort = DECOUPLED_PORTS[userRole];
    const currentPort = window.location.port ? parseInt(window.location.port, 10) : 80;

    if (targetPort && currentPort !== targetPort) {
      const isAlive = await pingPort(targetPort, 300);
      if (isAlive) {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const b64User = btoa(encodeURIComponent(JSON.stringify(userObj)));
        const targetPath = roleRedirectMap[userRole] || '/';
        window.location.href = `http://localhost:${targetPort}/auth-sync?token=${token}&user=${b64User}&redirect=${encodeURIComponent(targetPath)}`;
        return true;
      }
    }
  }

  const targetPath = from || roleRedirectMap[userRole] || '/';
  navigate(targetPath);
  return false;
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, loginGoogle, triggerWelcomeModal, loading: authLoading } = useAuth();

  const from = location.state?.from || null;
  const { error: showError } = useNotification();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isAuthenticating] = useState(false);
  const [lockoutData, setLockoutData] = useState(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_SECONDS = 10 * 60;

  // Recuperar bloqueo al montar desde localStorage (mismo navegador)
  useEffect(() => {
    const saved = localStorage.getItem('laika_lockout');
    if (saved) {
      try {
        const { email, expiresAt } = JSON.parse(saved);
        const remaining = Math.floor((new Date(expiresAt) - new Date()) / 1000);
        if (remaining > 0) {
          setFormData((prev) => ({ ...prev, email }));
          setLockoutData({ email, remainingSeconds: remaining });
        } else {
          localStorage.removeItem('laika_lockout');
          setFailedAttempts(0);
        }
      } catch {
        localStorage.removeItem('laika_lockout');
      }
    }
  }, []);

  // Redirección si ya está autenticado (evita parpadeo del login)
  useEffect(() => {
    if (!authLoading && user) {
      handleRoleRedirection(user, navigate, from);
    }
  }, [user, authLoading, navigate, from]);

  // Verifica en el servidor si ese email está bloqueado
  const checkEmailLockout = async (emailToCheck) => {
    if (!emailToCheck || !/\S+@\S+\.\S+/.test(emailToCheck)) return;
    try {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const API = process.env.REACT_APP_API_URL || (isLocal ? 'http://localhost:8000/api' : '/api');
      const baseUrl = API.endsWith('/api') ? API : `${API.replace(/\/+$/, '')}/api`;
      const res = await fetch(
        `${baseUrl}/auth/check-lockout?email=${encodeURIComponent(emailToCheck)}`
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data.locked && data.retry_after > 0) {
        const expiresAt = new Date(Date.now() + data.retry_after * 1000).toISOString();
        localStorage.setItem(
          'laika_lockout',
          JSON.stringify({ email: emailToCheck, expiresAt })
        );
        setLockoutData({ remainingSeconds: data.retry_after });
        setFailedAttempts(MAX_ATTEMPTS);
      } else if (data.failed_attempts > 0) {
        setFailedAttempts(data.failed_attempts);
      }
    } catch {
      /* silencioso */
    }
  };

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
      newErrors.email = 'Ingresa tu correo electrónico';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato del correo no es válido';
    }
    if (!formData.password) {
      newErrors.password = 'Ingresa tu contraseña';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    localStorage.setItem('laika_last_email', formData.email);

    try {
      const result = await login(formData);

      if (result?.success) {
        localStorage.removeItem('laika_lockout');
        setFailedAttempts(0);
        triggerWelcomeModal();
        handleRoleRedirection(result.user, navigate, from);
      } else if (result.status === 423) {
        const retryAfter = result.error?.retry_after || LOCKOUT_SECONDS;
        const expiresAt = new Date(Date.now() + retryAfter * 1000).toISOString();
        localStorage.setItem(
          'laika_lockout',
          JSON.stringify({ email: formData.email, expiresAt })
        );
        setLockoutData({ remainingSeconds: retryAfter });
        setFailedAttempts(MAX_ATTEMPTS);
      } else {
        const detail = result.error;
        const serverAttempts = detail?.attempts ?? failedAttempts + 1;
        const maxAttempts = detail?.max_attempts ?? MAX_ATTEMPTS;
        setFailedAttempts(serverAttempts);

        if (serverAttempts >= maxAttempts) {
          const expiresAt = new Date(Date.now() + LOCKOUT_SECONDS * 1000).toISOString();
          localStorage.setItem(
            'laika_lockout',
            JSON.stringify({ email: formData.email, expiresAt })
          );
          setLockoutData({ remainingSeconds: LOCKOUT_SECONDS });
        } else {
          setErrors((prev) => ({ ...prev, password: '' }));
        }
      }
    } catch (err) {
      console.error('Error en login:', err);
      showError('Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    try {
      const result = await loginGoogle(tokenResponse.credential || tokenResponse.access_token);
      if (result.success) {
        triggerWelcomeModal();
        handleRoleRedirection(result.user, navigate, from);
      } else {
        showError(result.error || 'Error al autenticar con Google');
      }
    } catch {
      showError('Falla crítica en autenticación de Google');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => showError('Inicio de sesión de Google fallido'),
    flow: 'implicit',
  });

  const handleLockoutComplete = () => {
    setLockoutData(null);
    localStorage.removeItem('laika_lockout');
  };

  const attemptsLeft = MAX_ATTEMPTS - failedAttempts;

  return (
    <>
      <AuthShell
        title="Inicia sesión"
        subtitle="Accede a tus boletos, historial de compras y eventos próximos."
        sideKicker="Bienvenido de vuelta"
        sideTitle="Tus entradas listas en un solo lugar"
        sideCopy="Accede rápido a tu bóveda digital, comparte boletos de forma segura y sigue la cuenta regresiva de cada evento."
        overlay={
          lockoutData && (
            <LockoutOverlay
              remainingSeconds={lockoutData.remainingSeconds}
              email={formData.email}
              onComplete={handleLockoutComplete}
              onSwitchAccount={() => {
                setLockoutData(null);
                setFormData({ email: '', password: '', rememberMe: true });
                localStorage.removeItem('laika_lockout');
              }}
            />
          )
        }
        footer={
          <>
            <span>¿No tienes cuenta?</span>
            <Link to="/register" className={styles.footerLink}>
              Crear cuenta
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.fieldGroup}>
            <label htmlFor="login-email" className={styles.fieldLabel}>
              Correo electrónico
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => {
                handleChange(e);
                if (lockoutData && e.target.value !== formData.email) {
                  const saved = localStorage.getItem('laika_lockout');
                  if (saved) {
                    try {
                      const { email: lockedEmail } = JSON.parse(saved);
                      if (e.target.value.toLowerCase() !== lockedEmail?.toLowerCase()) {
                        setLockoutData(null);
                        setFailedAttempts(0);
                      }
                    } catch {
                      /* ok */
                    }
                  }
                }
              }}
              onBlur={(e) => checkEmailLockout(e.target.value)}
              placeholder="tu@correo.com"
              autoComplete="email"
              disabled={Boolean(lockoutData) || loading}
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              required
            />
            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="login-password" className={styles.fieldLabel}>
              Contraseña
            </label>
            <div className={styles.inputWrap}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                disabled={Boolean(lockoutData) || loading}
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
          </div>

          {/* Indicador de intentos fallidos (sin emojis) */}
          {failedAttempts > 0 && failedAttempts < MAX_ATTEMPTS && (
            <div
              className={`${styles.attemptBanner} ${
                failedAttempts === 1 ? styles.attemptBannerWarn : styles.attemptBannerDanger
              }`}
              role="alert"
            >
              <div className={styles.attemptHeader}>
                <span className={styles.attemptTitleRow}>
                  <Icon name={failedAttempts === 1 ? 'alertTriangle' : 'alertCircle'} size={15} />
                  <span>
                    {failedAttempts === 1
                      ? 'Contraseña incorrecta'
                      : 'Último intento antes del bloqueo'}
                  </span>
                </span>
                <span>
                  {failedAttempts}/{MAX_ATTEMPTS}
                </span>
              </div>
              <div className={styles.attemptBarTrack}>
                <div
                  className={styles.attemptBarFill}
                  style={{ width: `${(failedAttempts / MAX_ATTEMPTS) * 100}%` }}
                />
              </div>
              <span className={styles.attemptSub}>
                Te {attemptsLeft === 1 ? 'queda' : 'quedan'}{' '}
                <strong>
                  {attemptsLeft} {attemptsLeft === 1 ? 'intento' : 'intentos'}
                </strong>{' '}
                antes del bloqueo temporal de 10 minutos.
              </span>
            </div>
          )}

          <div className={styles.optionsRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, rememberMe: e.target.checked }))
                }
                className={styles.checkboxInput}
              />
              <span>Recordarme</span>
            </label>

            <Link to="/forgot-password" className={styles.inlineLink}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading || Boolean(lockoutData)}
          >
            <span>{loading ? 'Iniciando sesión...' : 'Iniciar sesión'}</span>
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

      {isAuthenticating && <LoadingScreen />}
    </>
  );
};

export default Login;
