import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Search, ShoppingBag, User, Menu, X, LogOut, Settings, Award, Heart } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartCount, toggleCart } = useCart();
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'INICIO', path: '/' },
        { name: 'EVENTOS', path: '/events' },
        { name: 'TIENDA', path: '/shop' },
        { name: 'NOSOTROS', path: '/about' },
        { name: 'CONTACTO', path: '/contact' }
    ];

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${isMenuOpen ? 'menu-open' : ''}`}>
            <div className="navbar-container">
                <div className="navbar-brand">
                    <Link to="/" onClick={() => setIsMenuOpen(false)}>
                        <span className="brand-laika">LAIKA</span>
                        <span className="brand-club">CLUB</span>
                    </Link>
                </div>

                <div className="navbar-special-action desktop-only">
                    <Link to="/shop?mode=global" className="laika-shop-nav-btn">
                        <ShoppingBag size={14} />
                        LAIKA SHOP
                        <span className="btn-glow"></span>
                    </Link>
                </div>

                <div className="navbar-links desktop-only">
                    {navLinks.map(link => (
                        <Link 
                            key={link.name} 
                            to={link.path} 
                            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="navbar-actions">
                    <button className="icon-btn favorites-trigger" onClick={() => navigate('/favorites')}>
                        <Heart size={20} />
                    </button>
                    
                    <button className="icon-btn cart-trigger" onClick={() => navigate('/cart')}>
                        <ShoppingBag size={20} />
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </button>
                    {user ? (
                        <div className="user-nav">
                            <Link to="/user/dashboard" className="user-profile-trigger">
                                <User size={20} />
                                <span className="desktop-only">{user.name?.split(' ')[0]}</span>
                            </Link>
                        </div>
                    ) : null}

                    <button className="icon-btn menu-trigger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* MOBILE MENU */}
            <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                <div className="mobile-links">
                    {navLinks.map(link => (
                        <Link 
                            key={link.name} 
                            to={link.path} 
                            className="mobile-link"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
