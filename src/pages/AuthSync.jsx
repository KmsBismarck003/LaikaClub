import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const AuthSync = () => {
  const { search } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(search)
    const token = params.get('token')
    const userB64 = params.get('user')
    const redirect = params.get('redirect') || '/user/dashboard'

    if (token && userB64) {
      try {
        const userStr = decodeURIComponent(atob(userB64))
        const userObj = JSON.parse(userStr)

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userObj))

        const safeRedirect = redirect.startsWith('/') && !redirect.startsWith('//')
          ? redirect
          : '/user/dashboard'
        window.location.replace(safeRedirect)
      } catch (err) {
        console.error('Error sincronizando SSO:', err)
        navigate('/login', { replace: true })
      }
    } else {
      navigate('/login', { replace: true })
    }
  }, [search, navigate])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0a', color: '#fff' }}>
      <h2>Sincronizando Sesión...</h2>
      <p style={{ opacity: 0.7 }}>Accediendo a Laika Club</p>
    </div>
  )
}

export default AuthSync

