import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import Icon from '../Icons/Icons'
import Dropdown from '../Dropdown/Dropdown'
import { getImageUrl } from '../../utils/imageUtils'
import api from '../../services/api'
import '../../layouts/css/Navbar.css'

const HomeNavbar = ({ user, logout, cartCount, toggleCart, showUserDropdown, setShowUserDropdown, userDropdownRef }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchQuery, setSearchQuery] = useState('')
    const [searchLocation, setSearchLocation] = useState('Todo México')
    const [searchDate, setSearchDate] = useState('Todas las fechas')
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [allEvents, setAllEvents] = useState([])
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const searchContainerRef = useRef(null)

    // Sincronizar estados con URL
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        setSearchQuery(params.get('q') || '')
        setSearchLocation(params.get('city') || 'Todo México')
        setSearchDate(params.get('date') || 'Todas las fechas')
    }, [location.search])

    // Cargar eventos para el autocompletado
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const events = await api.event.getPublic({ limit: 100 })
                setAllEvents(events || [])
            } catch (err) {
                console.error('Error fetching events for suggestions:', err)
            }
        }
        fetchEvents()
    }, [])

    // Filtrar sugerencias
    useEffect(() => {
        if (!searchQuery.trim() || searchQuery.length < 2) {
            setSuggestions([])
            setShowSuggestions(false)
            return
        }
        const filtered = allEvents.filter(event => 
            event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 6)
        setSuggestions(filtered)
        setShowSuggestions(filtered.length > 0)
    }, [searchQuery, allEvents])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSearch = (e, updatedLocation, updatedDate) => {
        if (e) e.preventDefault()
        const query = searchQuery
        const city = updatedLocation || searchLocation
        const date = updatedDate || searchDate
        const params = new URLSearchParams()
        if (query) params.append('q', query)
        if (city !== 'Todo México') params.append('city', city)
        if (date !== 'Todas las fechas') params.append('date', date)
        navigate(`/?${params.toString()}`)
        setShowSuggestions(false)
    }

    const getUserDisplayName = () => {
        if (!user) return ''
        if (user.firstName) return user.firstName
        return user.email?.split('@')[0] || 'Usuario'
    }

    const getDashboardLink = () => {
        if (!user?.role) return '/user/dashboard'
        switch (user.role) {
            case 'admin': return '/admin'
            case 'gestor': return '/events/manage'
            case 'operador': return '/staff'
            default: return '/user/dashboard'
        }
    }

    return (
        <div className='main-navbar-container'>
            <div className="navbar-top-row">
                <div className="brand-nav-group">
                    <div className='main-navbar-brand' onClick={() => navigate('/')}>
                        <img src="/logob.png" alt="LAIKA Club" style={{ height: '32px' }} />
                    </div>
                    <nav className='main-navbar-nav desktop-nav'>
                        <button className='main-nav-link' onClick={() => navigate('/?category=concert')}>Conciertos</button>
                        <button className='main-nav-link' onClick={() => navigate('/?category=theater')}>Teatro</button>
                        <button className='main-nav-link' onClick={() => navigate('/?category=sport')}>Deportes</button>
                        <button className='main-nav-link' onClick={() => navigate('/?category=family')}>Familia</button>
                        <button className='main-nav-link' onClick={() => navigate('/?category=other')}>Especiales</button>
                        <button className='main-nav-link' onClick={() => navigate('/?city=CDMX')}>Ciudades</button>
                    </nav>
                </div>

                <div className='main-navbar-actions desktop-actions'>
                    <button className="laika-shop-pill-btn" onClick={() => navigate('/shop?mode=global')}>
                        <div className="btn-content">
                            <Icon name="shoppingBasket" size={14} />
                            <span>LAIKA SHOP</span>
                        </div>
                    </button>
                    <div className="navbar-utility-separator" />
                    <button className="navbar-cart-btn-main" onClick={() => navigate('/cart')}>
                        <Icon name="shoppingCart" size={18} />
                        {cartCount > 0 && <span className="cart-badge-main">{cartCount}</span>}
                    </button>
                    <div className="navbar-utility-separator" />
                    {user ? (
                        <div className='main-user-menu-group'>
                            <button className="main-nav-link admin-navbar-btn" onClick={() => navigate(getDashboardLink())}>
                                <Icon name="dashboard" size={16} />
                                <span>DASHBOARD</span>
                            </button>
                            
                            <div className='main-user-menu' ref={userDropdownRef}>
                                <Dropdown
                                    trigger={
                                        <button className='main-user-btn'>
                                            <Icon name="user" size={16} />
                                            <span className='main-user-name'>{getUserDisplayName().toUpperCase()}</span>
                                            <Icon name="chevronDown" size={14} className={showUserDropdown ? 'open' : ''} />
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

                                    <Dropdown.Item onClick={() => navigate(getDashboardLink())} icon={<Icon name="dashboard" size={16} />}>
                                        Dashboard
                                    </Dropdown.Item>

                                    <Dropdown.Divider />

                                    <Dropdown.Item onClick={logout} danger icon={<Icon name="logout" size={16} />}>
                                        Cerrar Sesión
                                    </Dropdown.Item>
                                </Dropdown>
                            </div>
                        </div>
                    ) : (
                        <button className="navbar-auth-btn login-navbar-btn" onClick={() => navigate('/login')}>
                            <Icon name="user" size={17} />
                            <span>INGRESA</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="navbar-search-row">
                <form className={`tm-search-block ${(searchQuery || isSearchFocused) ? 'is-active' : ''}`} onSubmit={handleSearch}>
                    <div className="search-section">
                        <Icon name="mapPin" size={16} className="section-icon" />
                        <div className="section-content">
                            <span className="label">UBICACIÓN</span>
                            <Dropdown triggerOnHover={false} className="value-dropdown" trigger={<span className="value">{searchLocation}</span>}>
                                <Dropdown.Item onClick={() => { setSearchLocation('Todo México'); handleSearch(null, 'Todo México'); }}>Todo México</Dropdown.Item>
                                <Dropdown.Item onClick={() => { setSearchLocation('CDMX'); handleSearch(null, 'CDMX'); }}>CDMX</Dropdown.Item>
                            </Dropdown>
                        </div>
                    </div>
                    <div className="search-divider" />
                    <div className="search-section" ref={searchContainerRef}>
                        <Icon name="search" size={16} className="section-icon" />
                        <div className="section-content">
                            <span className="label">BUSCAR</span>
                            <input
                                type="text"
                                placeholder="Artista, evento o inmueble"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                            />
                        </div>
                        {showSuggestions && (
                            <div className="navbar-search-suggestions">
                                {suggestions.map(event => (
                                    <div key={event.id} className="suggestion-item" onClick={() => navigate(`/event/${event.id || event._id}`)}>
                                        <div className="suggestion-image"><img src={getImageUrl(event.imageUrl || event.image_url)} alt="" /></div>
                                        <div className="suggestion-info"><span className="suggestion-name">{event.name}</span></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button type="submit" className="search-submit-btn">Buscar</button>
                </form>
            </div>
        </div>
    )
}

export default HomeNavbar
