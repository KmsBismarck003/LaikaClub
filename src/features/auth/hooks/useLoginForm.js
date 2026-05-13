/**
 * @file features/auth/hooks/useLoginForm.js
 * @description Hook de dominio para el formulario de inicio de sesión.
 *
 * Separa la lógica de login (validación, submit, manejo de errores)
 * de la presentación visual en Login.jsx.
 *
 * @layer features/auth
 */

import { useState, useCallback } from 'react'
import { useAuth } from '../../../context'
import { useForm } from '../../../hooks'
import { validateEmail } from '../../../utils'

/**
 * Reglas de validación del formulario de login.
 */
const LOGIN_VALIDATION_RULES = {
  email: {
    required: 'El email es requerido',
    validate: (value) => validateEmail(value) || 'Email no válido',
  },
  password: {
    required: 'La contraseña es requerida',
    minLength: { value: 6, message: 'Mínimo 6 caracteres' },
  },
}

/**
 * Hook para el formulario de inicio de sesión.
 * @param {Object} options
 * @param {Function} [options.onSuccess] - Callback al hacer login exitoso
 * @returns {{
 *   values: Object,
 *   errors: Object,
 *   handleChange: Function,
 *   handleSubmit: Function,
 *   submitting: boolean,
 *   loginError: string|null,
 *   showPassword: boolean,
 *   togglePassword: Function
 * }}
 */
const useLoginForm = ({ onSuccess } = {}) => {
  const { login } = useAuth()
  const [loginError, setLoginError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const { values, errors, handleChange, validate, resetForm } = useForm(
    { email: '', password: '', rememberMe: false },
    LOGIN_VALIDATION_RULES
  )

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault()
      setLoginError(null)

      const isValid = validate()
      if (!isValid) return

      try {
        await login(values.email, values.password, values.rememberMe)
        onSuccess?.()
      } catch (err) {
        // Clasificar el tipo de error para feedback específico
        if (err.status === 401) {
          setLoginError('Credenciales incorrectas. Verifica tu email y contraseña.')
        } else if (err.status === 423) {
          setLoginError('Tu cuenta está bloqueada. Contacta soporte.')
        } else if (err.status === 429) {
          setLoginError('Demasiados intentos. Espera unos minutos.')
        } else {
          setLoginError(err.message || 'Error al iniciar sesión. Intenta de nuevo.')
        }
      }
    },
    [values, validate, login, onSuccess]
  )

  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  return {
    values,
    errors,
    handleChange,
    handleSubmit,
    loginError,
    showPassword,
    togglePassword,
    resetForm,
  }
}

export default useLoginForm
