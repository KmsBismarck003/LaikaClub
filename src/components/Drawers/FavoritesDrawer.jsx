import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext';
import { useCart } from '../../context/CartContext';
import Icon from '../Icons/Icons';
import './Drawers.css';

const FavoritesDrawer = () => {
    const { 
        favorites, 
        isFavoritesOpen, 
        closeFavorites, 
        toggleFavorite,
        favoritesCount 
    } = useFavorites();
    
    const navigate = useNavigate();
    const { addMerchToCart } = useCart();

    const handleAddToCart = (product) => {
        // Asumimos variante por defecto o la primera disponible si es merch
        const defaultVariant = product.variants?.[0] || { 
            id: `default_${product.id}`, 
            price: product.price,
            size: 'Único' 
        };
        addMerchToCart(product, defaultVariant, 1);
        closeFavorites();
        navigate('/cart');
    };

    return (
        <>
            <div 
                className={`industrial-drawer-overlay ${isFavoritesOpen ? 'active' : ''}`}
                onClick={closeFavorites}
            />
            
            <aside className={`industrial-drawer ${isFavoritesOpen ? 'active' : ''}`}>
                <div className="drawer-header">
                    <div className="drawer-title">
                        <Icon name="heart" size={18} style={{ color: '#ff3c00' }} />
                        <span>Mis Favoritos ({favoritesCount})</span>
                    </div>
                    <button className="drawer-close-btn" onClick={closeFavorites}>
                        <Icon name="close" size={20} />
                    </button>
                </div>

                <div className="drawer-content">
                    {favorites.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <Icon name="heart" size={30} />
                            </div>
                            <span className="empty-state-text">No tienes productos en favoritos</span>
                        </div>
                    ) : (
                        favorites.map((product, index) => (
                            <div 
                                className="drawer-item" 
                                key={product.id}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="drawer-item-img">
                                    <img src={product.image_url || product.image} alt={product.name} />
                                </div>
                                <div className="drawer-item-info">
                                    <h4 className="drawer-item-name">{product.name}</h4>
                                    <p className="drawer-item-price">${product.price}</p>
                                    <div className="drawer-item-actions">
                                        <button 
                                            className="drawer-btn-sm"
                                            onClick={() => handleAddToCart(product)}
                                        >
                                            + AL CARRITO
                                        </button>
                                        <button 
                                            className="drawer-btn-sm danger"
                                            onClick={() => toggleFavorite(product)}
                                        >
                                            ELIMINAR
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </aside>
        </>
    );
};

export default FavoritesDrawer;
