import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useCart } from '../../context/CartContext'
import Icon from '../Icons/Icons'
import NotificationBell from '../Notifications/NotificationBell'
import './Navbar.css'

const Navbar = () => {
  const navigate = useNavigate()
  const { user, logout, isGuestPreview, toggleGuestPreview } = useAuth()
  const { cart, toggleCart } = useCart()
  const { isDark } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setShowUserMenu(false)
  }, [navigate])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [menuOpen])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    const handleMediaQueryChange = (e) => {
      if (!e.matches) {
        setMenuOpen(false)
      }
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaQueryChange)
    } else {
      mediaQuery.addListener(handleMediaQueryChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaQueryChange)
      } else {
        mediaQuery.removeListener(handleMediaQueryChange)
      }
    }
  }, [])

  // Cerrar dropdown de usuario al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    setShowUserMenu(false)
    navigate('/login')
  }

  const closeMenu = () => {
    setMenuOpen(false)
    setShowUserMenu(false)
  }

  const getDashboardLink = () => {
    if (!user?.role) return '/profile'

    switch (user.role) {
      case 'admin':
        return '/admin'
      case 'gestor':
        return '/gestor'
      case 'operador':
        return '/operador'
      default:
        return '/profile'
    }
  }

  const getUserInitials = () => {
    if (!user) return ''
    const first = user.firstName?.charAt(0) || ''
    const last = user.lastName?.charAt(0) || ''
    return (first + last).toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'
  }

  const getUserDisplayName = () => {
    if (!user) return ''
    if (user.firstName) return user.firstName
    return user.email?.split('@')[0] || 'Usuario'
  }

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-top">
        <div className="navbar-top-container">
          <div className="navbar-top-left">
            <div className="top-item">
              <Icon name="globe" size={12} />
              <span>MX</span>
            </div>
            <div className="top-item">
              <Icon name="messageSquare" size={12} />
              <span>ES</span>
            </div>
            <div className="top-item">
              <Icon name="mapPin" size={12} />
              <span>TODO MÉXICO</span>
            </div>
          </div>
          <div className="navbar-top-right">
            <Link to="/help" className="top-link">AYUDA</Link>
          </div>
        </div>
      </div>
      <div className='navbar-container'>
        <Link to='/' className='navbar-logo' onClick={closeMenu}>
          <img
            src={isDark ? "/logob.png" : "/logoN.PNG"}
            alt="LAIKA Club"
            className="navbar-logo-img"
          />
        </Link>

        <button
          className={`navbar-toggle ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label='Toggle menu'
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {menuOpen && (
          <div
            className='navbar-overlay'
            onClick={closeMenu}
            aria-hidden='true'
          />
        )}

        <ul className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <li>
            <Link to='/' className='navbar-link' onClick={closeMenu}>
              Inicio
            </Link>
          </li>

          {/* Carrito Global - Siempre visible */}
          <li className='navbar-cart'>
            <button
              className='navbar-cart-btn'
              onClick={toggleCart}
              aria-label='Ver carrito'
            >
              <Icon name="shoppingCart" size={20} />
              {cart.length > 0 && (
                <span className='navbar-cart-badge'>
                  {cart.length}
                </span>
              )}
            </button>
          </li>

          {user && !isGuestPreview && (
            <>
              <li>
                <Link
                  to={getDashboardLink()}
                  className='navbar-link'
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
              </li>

              {/* Notificaciones */}
              <li className='navbar-notifications'>
                <NotificationBell />
              </li>



              {/* User Dropdown */}
              <li className='navbar-user' ref={userMenuRef}>
                <button
                  className='navbar-user-btn'
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label='Menu de usuario'
                  aria-expanded={showUserMenu}
                >
                  <span className='navbar-user-avatar'>
                    <Icon name="user" size={18} />
                  </span>
                  <span className='navbar-user-name'>
                    {getUserDisplayName()}
                  </span>
                  <Icon
                    name="chevronDown"
                    size={14}
                    className={`navbar-user-chevron ${showUserMenu ? 'open' : ''}`}
                  />
                </button>

                {showUserMenu && (
                  <div className='navbar-user-dropdown'>
                    <div className='navbar-user-dropdown-header'>
                      <span className='navbar-user-dropdown-avatar'>
                        <Icon name="user" size={20} />
                      </span>
                      <div className='navbar-user-dropdown-info'>
                        <span className='navbar-user-dropdown-name'>
                          {user.firstName} {user.lastName}
                        </span>
                        <span className='navbar-user-dropdown-email'>
                          {user.email}
                        </span>
                      </div>
                    </div>

                    <div className='navbar-user-dropdown-divider' />

                    {user?.role === 'usuario' && (
                      <Link
                        to='/profile'
                        className='navbar-user-dropdown-item'
                        onClick={closeMenu}
                      >
                        <Icon name="user" size={16} />
                        Mi Perfil
                      </Link>
                    )}

                    <Link
                      to={getDashboardLink()}
                      className='navbar-user-dropdown-item'
                      onClick={closeMenu}
                    >
                      <Icon name="dashboard" size={16} />
                      Dashboard
                    </Link>

                    <div className='navbar-user-dropdown-divider' />

                    <button
                      onClick={handleLogout}
                      className='navbar-user-dropdown-item navbar-user-dropdown-logout'
                    >
                      <Icon name="logout" size={16} />
                      Cerrar Sesion
                    </button>
                  </div>
                )}
              </li>
            </>
          )}

          {/* Admin Preview Toggle */}
          {(user?.role === 'admin' || user?.role === 'gestor') && (
            <li>
              <button
                onClick={toggleGuestPreview}
                className={`navbar-btn ${isGuestPreview ? 'navbar-btn-warning' : 'navbar-btn-outline'}`}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  style={{ marginRight: '6px', verticalAlign: 'middle' }}
                >
                  <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
                  <circle cx='12' cy='12' r='3' />
                </svg>
                {isGuestPreview ? 'Salir de Vista Previa' : 'Ver como Invitado'}
              </button>
            </li>
          )}

          {/* Login/Register */}
          {(!user || isGuestPreview) && (
            <>
              <li>
                <Link
                  to='/login'
                  className='navbar-btn navbar-btn-primary'
                  onClick={closeMenu}
                >
                  Iniciar Sesion
                </Link>
              </li>
              <li>
                <Link
                  to='/register'
                  className='navbar-btn navbar-btn-secondary'
                  onClick={closeMenu}
                >
                  Registrarse
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
