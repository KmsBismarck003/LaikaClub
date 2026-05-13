import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dropdown, Icon } from '../../components'
import { getImageUrl } from '../../utils/imageUtils'
import { useAuth } from '../../context/AuthContext'
import '../../layouts/css/Navbar.css'

const ShopNavbar = ({ user, cartCount, toggleCart, favoritesCount, toggleFavorites, showUserDropdown, setShowUserDropdown, userDropdownRef }) => {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const [shopSearchQuery, setShopSearchQuery] = useState('')

    const handleShopSearch = (e) => {
        if (e) e.preventDefault()
        if (shopSearchQuery.trim()) {
            navigate(`/shop?q=${encodeURIComponent(shopSearchQuery)}`)
        } else {
            navigate('/shop')
        }
    }

    const getUserDisplayName = () => {
        if (!user) return ''
        if (user.firstName) return user.firstName
        return user.email?.split('@')[0] || 'USUARIO'
    }

    return (
        <div className='main-navbar-container'>
            <div className="navbar-top-row shop-mode-row">
                <div className="brand-nav-group">
                    <div className='main-navbar-brand' onClick={() => navigate('/shop')}>
                        <img src="/logob.png" alt="LAIKA Club" style={{ height: '32px' }} />
                    </div>
                </div>

                {/* Buscador Integrado de la Tienda */}
                <div className="shop-integrated-search">
                    <form className="central-search-engine" onSubmit={handleShopSearch}>
                        <div className="search-category-dropdown">
                            <span>Todas las categorías</span>
                            <Icon name="chevronDown" size={14} />
                        </div>
                        <div className="search-input-wrapper">
                            <input 
                                type="text" 
                                placeholder="Buscar artistas, camisetas, gorras o giras..."
                                value={shopSearchQuery}
                                onChange={(e) => setShopSearchQuery(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="search-submit-btn">
                            <Icon name="search" size={18} />
                            <span>BUSCAR</span>
                        </button>
                    </form>
                </div>

                 <div className='main-navbar-actions desktop-actions'>
                    <div className="shop-actions-group">
                        {/* Perfil de Usuario con Dropdown */}
                        {user ? (
                            <div className='main-user-menu' ref={userDropdownRef}>
                                <Dropdown
                                    trigger={
                                        <button className='navbar-auth-btn'>
                                            <Icon name="user" size={18} />
                                            <span>{getUserDisplayName().toUpperCase()}</span>
                                            <Icon name="chevronDown" size={14} style={{ marginLeft: '5px', opacity: 0.5 }} />
                                        </button>
                                    }
                                    align="right"
                                    isOpen={showUserDropdown}
                                    setIsOpen={setShowUserDropdown}
                                >
                                    <div className="main-user-dropdown-header">
                                        <div className="main-user-avatar">
                                            {user.avatarUrl ? (
                                                <img src={getImageUrl(user.avatarUrl)} alt={user.firstName} />
                                            ) : (
                                                <Icon name="user" size={18} />
                                            )}
                                        </div>
                                        <div className="main-user-dropdown-info">
                                            <span className="main-user-dropdown-name">{user.firstName} {user.lastName}</span>
                                            <span className="main-user-dropdown-email">{user.email}</span>
                                        </div>
                                    </div>

                                    <Dropdown.Divider />

                                    <Dropdown.Item onClick={() => navigate('/user/profile')} icon={<Icon name="user" size={16} />}>
                                        Mi Perfil
                                    </Dropdown.Item>

                                    <Dropdown.Item onClick={() => navigate('/user/dashboard')} icon={<Icon name="dashboard" size={16} />}>
                                        Dashboard
                                    </Dropdown.Item>

                                    <Dropdown.Divider />

                                    <Dropdown.Item onClick={() => { logout(); navigate('/login'); }} danger icon={<Icon name="logout" size={16} />}>
                                        Cerrar Sesión
                                    </Dropdown.Item>
                                </Dropdown>
                            </div>
                        ) : (
                            <button className="navbar-auth-btn" onClick={() => navigate('/login')}>
                                <Icon name="user" size={18} />
                                <span>INGRESAR</span>
                            </button>
                        )}

                        {/* Favoritos - Conectado al Drawer */}
                        <button className="navbar-auth-btn" onClick={toggleFavorites}>
                            <Icon name="heart" size={18} />
                            <span>FAVORITOS</span>
                            {favoritesCount > 0 && <span className="cart-badge-main" style={{ background: '#ff3c00' }}>{favoritesCount}</span>}
                        </button>

                        {/* Carrito - Navegación Directa (Mismo estilo que Home) */}
                        <div className="navbar-utility-separator" />
                        <button className="navbar-cart-btn-main" onClick={() => navigate('/cart')}>
                            <Icon name="shoppingCart" size={18} />
                            <span style={{ fontSize: '0.65rem', marginLeft: '5px', fontWeight: 800 }}>CARRITO</span>
                            {cartCount > 0 && <span className="cart-badge-main">{cartCount}</span>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShopNavbar
