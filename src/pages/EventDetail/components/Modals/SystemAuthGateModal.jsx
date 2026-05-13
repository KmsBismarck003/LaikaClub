import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useNotification } from '../../../../context/NotificationContext';
import { Input, Button, LockoutOverlay, Icon, Modal } from '../../../../components';
import { useGoogleLogin } from '@react-oauth/google';

// IMPORTACIÓN DE ESTILOS ORIGINALES DEL SISTEMA
import '../../../Login/Login.css';
import '../../../Login/AuthLayout.css';
import '../../../Login/AuthForm.css';
import '../../../Login/AuthFeedback.css';
import '../../../Login/AuthAnimations.css';
import '../../../Login/LoginSocial.css';

const SystemAuthGateModal = ({ isOpen, onClose, onGuestSuccess }) => {
  const { login, loginGoogle, triggerWelcomeModal } = useAuth();
  const { error: showError } = useNotification();
  
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: true });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [lockoutData, setLockoutData] = useState(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const result = await loginGoogle(tokenResponse.access_token);
        if (result?.success) {
          triggerWelcomeModal();
          onClose();
        }
      } catch (err) {
        showError('Error al autenticar con Google');
      }
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(formData);
      if (result?.success) {
        triggerWelcomeModal();
        onClose();
      }
    } catch (err) {
      setFailedAttempts(prev => prev + 1);
      showError('Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="large" 
        style={{ backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }} 
    >
      <div className='login-container' style={{ border: 'none', boxShadow: 'none', margin: 0, maxWidth: '800px', height: 'auto', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className='login-card' style={{ padding: '1.5rem 2.5rem' }}>
          {/* AVISO DE COMPRA COMPACTO */}
          <div style={{ 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '10px 15px',
              marginBottom: '15px',
              textAlign: 'center'
          }}>
              <p style={{ 
                  color: '#fff', 
                  fontSize: '0.7rem', 
                  fontWeight: 900, 
                  margin: '0 0 8px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  opacity: 0.8
              }}>
                  DEBES INICIAR SESIÓN PARA COMPRAR
              </p>
              
              <Button 
                variant="outline" 
                fullWidth 
                onClick={onGuestSuccess}
                style={{ 
                    borderColor: 'rgba(255,255,255,0.3)', 
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.65rem',
                    height: '32px',
                    padding: '0'
                }}
              >
                <Icon name="user" size={12} style={{ marginRight: '6px' }} />
                COMPRAR COMO INVITADO
              </Button>
          </div>

          <div className='login-header' style={{ marginBottom: '1rem' }}>
            <h1 className='login-title' style={{ fontSize: '1.6rem' }}>LAIKA Club</h1>
            <p className='login-subtitle' style={{ fontSize: '0.75rem' }}>Inicia sesión en tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className='login-form' style={{ gap: '0.8rem' }}>
            <Input
              label='Email'
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              placeholder='tu@email.com'
              fullWidth
              required
              style={{ padding: '10px' }}
            />

            <Input
              label='Contraseña'
              type='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              placeholder='••••••••'
              fullWidth
              required
              style={{ padding: '10px' }}
            />

            <div className='login-options' style={{ margin: '0', fontSize: '0.75rem' }}>
              <label className='remember-me'>
                <input 
                  type='checkbox' 
                  checked={formData.rememberMe}
                  onChange={e => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                />
                <span style={{ color: '#fff' }}>Recordarme</span>
              </label>
              <span className='forgot-password' style={{ cursor: 'pointer', color: '#fff' }}>
                ¿Olvidaste tu contraseña?
              </span>
            </div>

            <Button
              type='submit'
              variant='primary'
              fullWidth
              loading={loading}
              style={{ 
                  background: '#fff', 
                  height: '45px',
                  marginTop: '0.5rem'
              }}
            >
              <span style={{ color: '#000', fontWeight: 950, fontSize: '0.85rem', textTransform: 'uppercase' }}>
                Iniciar Sesión
              </span>
            </Button>
          </form>

          <div className="social-login-divider" style={{ margin: '0.8rem 0' }}>
            <span>O continúa con</span>
          </div>

          <div className="social-login-grid">
            <button 
                className="social-btn google" 
                onClick={() => handleGoogleLogin()} 
                type="button" 
                style={{ 
                    background: '#fff', 
                    height: '45px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '100%',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                }}
            >
              <svg className="social-svg" viewBox="0 0 24 24" width="20" height="20" style={{ marginRight: '10px' }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1c-4.3 0-8.01 2.47-9.82 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span style={{ color: '#000', fontWeight: 950, fontSize: '0.85rem' }}>GMAIL</span>
            </button>
          </div>

          <div className='login-footer'>
            <p>
              ¿No tienes una cuenta?{' '}
              <span className='register-link' style={{ cursor: 'pointer', fontWeight: 800 }}>
                Regístrate aquí
              </span>
            </p>
          </div>
        </div>

        <div className='login-illustration' style={{ display: 'flex' }}>
          <div className='illustration-content'>
            <h2>Bienvenido a LAIKA Club</h2>
            <p>Descubre los mejores eventos y experiencias</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SystemAuthGateModal;
