import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { Input, Button, LoadingScreen } from '../../components'
import './ForgotPassword.css'
import '../Login/AuthLayout.css'
import '../Login/AuthForm.css'
import '../Login/AuthFeedback.css'
import '../Login/AuthAnimations.css'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const { forgotPassword, resetPassword } = useAuth()
  const { success, error: showError } = useNotification()

  const [step, setStep] = useState('request') // 'request' o 'reset'
  const [loading, setLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({})

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateRequestStep = () => {
    const newErrors = {}
    if (!formData.email) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    return newErrors
  }

  const validateResetStep = () => {
    const newErrors = {}
    if (!formData.code) {
      newErrors.code = 'El código de verificación es requerido'
    } else if (formData.code.length !== 6) {
      newErrors.code = 'El código debe tener 6 dígitos'
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    return newErrors
  }

  const handleRequestCode = async (e) => {
    e.preventDefault()
    const newErrors = validateRequestStep()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const result = await forgotPassword(formData.email)
      if (result.success) {
        success('Código de recuperación enviado. Revisa tu bandeja de entrada.')
        setStep('reset')
      } else {
        showError(result.error || 'Error al enviar el código. Intenta nuevamente.')
      }
    } catch (err) {
      showError('Falla técnica al solicitar código.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    const newErrors = validateResetStep()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const result = await resetPassword({
        email: formData.email,
        code: formData.code,
        password: formData.newPassword
      })

      if (result.success) {
        // Efecto "Procesando" Premium
        setIsProcessing(true)
        await new Promise(resolve => setTimeout(resolve, 2000))
        setIsProcessing(false)
        
        success('¡Contraseña actualizada con éxito! Ahora puedes iniciar sesión.')
        navigate('/login')
      } else {
        showError(result.error || 'Código inválido o expirado.')
      }
    } catch (err) {
      showError('Error al actualizar contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='login-page'> {/* Reusamos el layout de login-page */}
      <div className='login-container'>
        <div className='login-card'>
          <div className='login-header'>
            <h1 className='login-title'>LAIKA Club</h1>
            <p className='login-subtitle'>
              {step === 'request' ? 'RECUPERA TU ACCESO' : 'VERIFICA TU IDENTIDAD'}
            </p>
          </div>

          <div className='step-indicator'>
            <div className={`step-dot ${step === 'request' ? 'active' : ''}`} />
            <div className={`step-dot ${step === 'reset' ? 'active' : ''}`} />
          </div>

          {step === 'request' ? (
            <form onSubmit={handleRequestCode} className='login-form'>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', textAlign: 'center' }}>
                Ingresa tu correo electrónico y te enviaremos un código de 6 dígitos para restablecer tu contraseña.
              </p>
              
              <Input
                label='Email Registrado'
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                placeholder='tu@email.com'
                error={errors.email}
                fullWidth
                required
                disabled={loading}
              />

              <Button
                type='submit'
                variant='primary'
                size='large'
                fullWidth
                loading={loading}
              >
                Enviar Código
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className='login-form'>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', textAlign: 'center' }}>
                Hemos enviado un código a <strong>{formData.email}</strong>. Ingrésalo junto a tu nueva contraseña.
              </p>

              <Input
                label='Código de 6 dígitos'
                type='text'
                name='code'
                value={formData.code}
                onChange={handleChange}
                placeholder='000000'
                error={errors.code}
                fullWidth
                required
                maxLength={6}
                disabled={loading}
                autoFocus
              />

              <Input
                label='Nueva Contraseña'
                type='password'
                name='newPassword'
                value={formData.newPassword}
                onChange={handleChange}
                placeholder='••••••••'
                error={errors.newPassword}
                fullWidth
                required
                disabled={loading}
              />

              <Input
                label='Confirmar Contraseña'
                type='password'
                name='confirmPassword'
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder='••••••••'
                error={errors.confirmPassword}
                fullWidth
                required
                disabled={loading}
              />

              <Button
                type='submit'
                variant='primary'
                size='large'
                fullWidth
                loading={loading}
              >
                Restablecer Contraseña
              </Button>

              <button 
                type="button" 
                className="back-to-login" 
                onClick={() => setStep('request')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'block', width: '100%', marginTop: '10px' }}
              >
                Volver a solicitar código
              </button>
            </form>
          )}

          <div className='login-footer'>
            <Link to='/login' className='back-to-login'>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Volver al Inicio de Sesión
            </Link>
          </div>
        </div>

        <div className='login-illustration' style={{ background: 'linear-gradient(135deg, #000 0%, #333 100%)' }}>
          <div className='illustration-content'>
            <h2>Seguridad Laika</h2>
            <p>Protegemos tu cuenta con sistemas de encriptación de grado industrial.</p>
          </div>
        </div>
      </div>

      {isProcessing && <LoadingScreen label="RESTABLECIENDO SEGURIDAD" />}
    </div>
  )
}

export default ForgotPassword
